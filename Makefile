CXXFLAGS:=-std=gnu++17 -Wall -O2 -MMD -MP -ggdb  -Iext

PROGRAMS = convert

all: $(PROGRAMS) dns-rfcs.js

dns-rfcs.js: dns-rfcs.json
	(echo "var dnsrfcs=" ; cat dns-rfcs.json ; echo ";" ) > dns-rfcs.js

clean:
	rm -f *~ *.o *.d test dns-rfcs.js $(PROGRAMS)

-include *.d

convert: convert.o
	g++ -std=gnu++17 $^ -o $@ 
