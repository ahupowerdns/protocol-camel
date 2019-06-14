#!/usr/bin/env python
# coding: utf-8

# In[1]:


import sys
from IPython.display import set_matplotlib_formats
from pandas.plotting import register_matplotlib_converters
register_matplotlib_converters()

import matplotlib
import math
import numpy as np
import scipy as sp
import seaborn as sns
import scipy.signal as sps
import matplotlib.pyplot as plt
plt.rcParams['figure.figsize'] = [9.5, 5]

import pandas

specific = "dns"
args = sys.argv[1:]
if len(args) >= 1:
    specific = args[0]

# In[6]:


data=pandas.read_csv("data/" + specific + "_camel.csv", delim_whitespace=True)
data["TIME"]=pandas.to_datetime(data["TIME"],infer_datetime_format=True, unit='s', utc=True)
data.set_index("TIME")


# In[28]:

for k in ["INTERNET_STANDARD", "PROPOSED_STANDARD", "EXPERIMENTAL", "HISTORIC", "BEST_CURRENT_PRACTICE", "OBSOLETED", "UNKNOWN"]:
    if k not in data:
        data[k] = 0

plt.figure()
plt.stackplot(data["TIME"], 
              data["INTERNET_STANDARD"], 
              data["PROPOSED_STANDARD"], 
              data["EXPERIMENTAL"], 
              data["HISTORIC"],
              data["BEST_CURRENT_PRACTICE"], 
              data["OBSOLETED"],
              data["UNKNOWN"],
              labels=["Internet Standard", "Proposed Standard", "Experimental", "Historic", "Best Current Practice", "Obsoleted", "Unknown"])
plt.legend(loc=2)
plt.grid()
plt.xlabel("Year")
plt.ylabel("Pages")
plt.title("Number of RFC pages covering " + specific.upper() + " over time")
plt.savefig("data/" + specific + "_camel-plot.png", dpi=300)


# In[29]:


plt.figure()
plt.stackplot(data["TIME"], 
              data["INTERNET_STANDARD"], 
              data["PROPOSED_STANDARD"], 
              data["BEST_CURRENT_PRACTICE"], 
              data["UNKNOWN"],
             labels=["Internet Standard", "Proposed Standard",  "Best Current Practice", "Unknown"])
plt.legend(loc=2)
plt.grid()
plt.xlabel("Year")
plt.ylabel("Pages")
plt.title("Number of RFC pages covering " + specific.upper() + " over time")
plt.savefig("data/" + specific + "_camel-plot-clean.png", dpi=300)


# In[ ]:




