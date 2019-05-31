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

Then compile and run "./convert" (requires a modern C++ compiler).

Then run "python3 camelplot.py", which will require you to have installed
matplotlib, pandas. Some guidance is on
[https://ds9a.nl/articles/posts/from-gnuplot-to-matplotlib-pandas/]

