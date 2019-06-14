# dns camel
Goal is to get a place where we can gather DNS relevant RFCs and drafts,
including page numbers and number of 'MUST' and 'SHOULD' statements.

Page is live on https://powerdns.org/dns-camel/

## How you can help
In various ways:

 * The source file [dns-rfc-annotations.json] is known to not list all DNS relevant RFCs
 * Check if your favorite RFCs are listed in the right categories

## Sources

 * https://www.rfc-editor.org/in-notes/rfc-index.xml
 * https://www.isc.org/community/rfcs/dns/
 * https://tools.ietf.org/wg/dnsop/
 * https://tools.ietf.org/wg/dprive/

## Updating the graphs
Get a fresh copy of rfc-index.xml, and update [dns-rfc-annotations.json]
with any fresh DNS wisdom you find in there.
```
    curl -Ss https://www.ietf.org/rfc/rfc-index.xml > ext/rfc-index.xml 
```

Then compile and run "./convert" (requires a modern C++ compiler).
```
    make convert
```

Then run "python3 camelplot.py", which will require you to have installed
matplotlib, pandas. Some guidance is on
[https://ds9a.nl/articles/posts/from-gnuplot-to-matplotlib-pandas/]

## Other IETF areas

## Notes on installed python requirements
The following is needed by the Python code.
```
  $ pip3 install IPython pandas matplotlib scipy seaborn
```

## Notes on installing Boost
The "convert" program uses "boost" libraries. You do not need to compile them; just have the for including.
Download the latest version from [Boost Downloads](https://www.boost.org/users/download/) and install similar to the following:
```
    mkdir ~/src ~/src/boost
    cd ~/src/boost
    shasum -a256 ~/Downloads/boost_1_70_0.tar.bz2
    tar xf ~/Downloads/boost_1_70_0.tar.bz2
```
The "Makefile" has a -I flag to include this library if not installed in the system directories.

