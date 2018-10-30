import datetime as dt
import numpy as np
import pandas as pd
from dateutil.relativedelta import relativedelta
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from datetime import datetime, timedelta
from flask import Flask, jsonify, render_template
from sqlalchemy import extract  
from sqlalchemy import create_engine
import numpy as np
import pandas as pd

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
engine=create_engine("sqlite:///db/bellybutton.sqlite")
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

  # print(Base.classes.keys())
# Save reference to the table
Samples = Base.classes.samples
Samples_Metadata= Base.classes.sample_metadata

# Create our session (link) from Python to the DB
session = Session(engine)
#################################################
# Flask Routes
#################################################
# Returns the dashboard homepage
@app.route("/")
def index():
    return render_template("index.html")

#################################################
# Returns a list of sample names
@app.route('/names')
def names():
    """Return a list of sample names."""

    # Use Pandas to perform the sql query
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)
    df.set_index('otu_id', inplace=True)

    # Return a list of the column names (sample names)
    return jsonify(list(df.columns)[2:])

#################################################
# Returns a list of OTU descriptions 
@app.route('/otu/')
def otu():
    """Return a list of OTU descriptions."""
    results = session.query(otu.lowest_taxonomic_unit_found).all()

    # Use numpy ravel to extract list of tuples into a list of OTU descriptions
    otu_list = list(np.ravel(results))
    return jsonify(otu_list)

#################################################
# Returns a json dictionary of sample metadata 
@app.route('/metadata/<sample>')
def sample_metadata(sample):
    """Return the MetaData for a given sample."""
    sel = [
        Samples_Metadata.SAMPLEID, 
        Samples_Metadata.ETHNICITY,
        Samples_Metadata.GENDER, 
        Samples_Metadata.AGE,
        Samples_Metadata.LOCATION, 
        Samples_Metadata.BBTYPE
        ]

    # sample[3:] strips the `BB_` prefix from the sample name to match
    # the numeric value of `SAMPLEID` from the database
    results = session.query(*sel).filter(Samples_Metadata.SAMPLEID == sample[3:]).all()

    # Create a dictionary entry for each row of metadata information
    sample_metadata = {}
    for result in results:
        sample_metadata['SAMPLEID'] = result[0]
        sample_metadata['ETHNICITY'] = result[1]
        sample_metadata['GENDER'] = result[2]
        sample_metadata['AGE'] = result[3]
        sample_metadata['LOCATION'] = result[4]
        sample_metadata['BBTYPE'] = result[5]

    print(sample_metadata)
    return jsonify(sample_metadata)


# Return a list of dictionaries containing sorted lists  for `otu_ids`and `sample_values`
@app.route('/samples/<sample>')
def samples(sample):
    """Return a list dictionaries containing `otu_ids` and `sample_values`."""
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)
    # Make sure that the sample was found in the columns, else throw an error
    if sample not in df.columns:
        print('no sample')
        return jsonify(f"Error! Sample: {sample} Not Found!"), 400

    # Return any sample values greater than 1
    df = df.loc[df[sample] > 1, ['otu_id', 'otu_label', sample]]
    print(df)
    # Sort the results by sample in descending order
    df = df.sort_values(by=sample, ascending=0)

    # Format the data to send as json
    data = {
        "otu_ids": df.otu_id.values.tolist(),
        "sample_values": df[sample].values.tolist(),
        "otu_labels": df.otu_label.tolist()
    }
    return jsonify(data)
if __name__ == "__main__":
    app.run(debug=True)