# protocol camel
Goal is to get a place where we can gather relevant RFCs and drafts,
including page numbers, and make graphs of them.

A sample page is live on https://powerdns.org/dns-camel/

## How you can help
In various ways:

 * The source file [data/dns-rfc-annotations.json] is known to not list all DNS relevant RFCs
 * Check if your favorite RFCs are listed in the right categories

We currently have files for BGP, DNS and NTP. Please contribute other
protocols!

## Sources

 * https://www.rfc-editor.org/in-notes/rfc-index.xml
 * https://www.isc.org/community/rfcs/dns/
 * https://tools.ietf.org/wg/dnsop/
 * https://tools.ietf.org/wg/dprive/

## Updating the graphs
Get a fresh copy of rfc-index.xml, and update the relevant rfc-annotations.json
file with any fresh documents you find out about:

```
    curl -Ss https://www.ietf.org/rfc/rfc-index.xml > ext/rfc-index.xml 
```

Then compile and run "./convert" (requires a modern C++ compiler).
```
    make convert
    ./convert bgp
```

Then run "python3 camelplot.py bgp", which will require you to have installed
matplotlib, pandas. Some guidance is on
[https://ds9a.nl/articles/posts/from-gnuplot-to-matplotlib-pandas/]

You can replace bgp by any protocol you want, as long as you have put the
right source files in the `data` directory.

## Notes on installed python requirements
The following is needed by the Python code.
```
  $ pip3 install IPython pandas matplotlib scipy seaborn
```

## Notes on installing Boost
The "convert" program uses "boost" libraries. You do not need to compile them; just have
them for including.

On most systems boost can be installed easily from packages (typically
libboost-dev or boost-devel).  If you have no packages and do not want to
compile, download the latest version from [Boost
Downloads](https://www.boost.org/users/download/) and install similar to the
following:

```
    mkdir ~/src ~/src/boost
    cd ~/src/boost
    shasum -a256 ~/Downloads/boost_1_70_0.tar.bz2
    tar xf ~/Downloads/boost_1_70_0.tar.bz2
```
The "Makefile" has a commented out -I flag to include this library if not installed in the system directories. 
Remove the '#' to enable it. 

