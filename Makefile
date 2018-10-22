CXXFLAGS:=-std=gnu++17 -Wall -O2 -MMD -MP -ggdb  -Iext

PROGRAMS = convert

all: $(PROGRAMS) 

clean:
	rm -f *~ *.o *.d test $(PROGRAMS)

-include *.d

convert: convert.o
	g++ -std=gnu++17 $^ -o $@ 
