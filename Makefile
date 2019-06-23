CXXFLAGS:=-std=gnu++17 -Wall -O2 -MMD -MP -ggdb  -Iext -I${HOME}/src/boost/boost_1_70_0

PROGRAMS = convert

all: $(PROGRAMS) 

clean:
	rm -f *~ *.o *.d test $(PROGRAMS)

-include *.d

convert: convert.o
	g++ -std=gnu++17 $^ -o $@ 
