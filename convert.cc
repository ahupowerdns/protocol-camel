#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/foreach.hpp>
#include <boost/algorithm/string.hpp>
#include <string>
#include <set>
#include <exception>
#include <iostream>
namespace pt = boost::property_tree;

using std::cout;
using std::endl;

int main(int argc, char** argv)
{
    // Create empty property tree object
    pt::ptree tree;

    // Parse the XML into the property tree.
    pt::read_xml(argv[1], tree);


    auto idx=tree.get_child("rfc-index");
    int count=0;
    std::string title;
    cout << "{";
    for(const auto& v : idx) {
      if(v.first=="rfc-entry") {
        if(count)
          cout<<",\n";
        count++;
        //        std::cout<<v.second.get_child("doc-id").data()<<" \""<<v.second.get_child("date.month").data()<<" " <<v.second.get_child("date.year").data()<<"\"\n";
        cout << '"' << v.second.get_child("doc-id").data() << "\": {";
        cout << "\"docID\": \"" << v.second.get_child("doc-id").data() << "\",";
        title = v.second.get_child("title").data();
        boost::replace_all(title, "\\", "\\\\");
        boost::replace_all(title, "\"", "\\\"");
        cout << "\"title\": \"" << title << "\", ";
        cout << "\"currentStatus\": \"" << v.second.get_child("current-status").data() << "\",";
        if(v.second.get_child("format").count("page-count"))
          cout << "\"pages\": " << v.second.get_child("format.page-count").data() << ",";
        else
          cout << "\"pages\": 0,";
        if(v.second.count("obsoleted-by"))
          cout << "\"obsoleted\": 1"<<",";
        else
          cout << "\"obsoleted\": 0"<<",";
        cout << "\"draft\": 0";
        cout << "}";
      }

    }
    cout << "}"<<endl;
    #if 0
    
    // Use the throwing version of get to find the debug filename.
    // If the path cannot be resolved, an exception is thrown.
    m_file = tree.get<std::string>("debug.filename");

    // Use the default-value version of get to find the debug level.
    // Note that the default value is used to deduce the target type.
    m_level = tree.get("debug.level", 0);

    // Use get_child to find the node containing the modules, and iterate over
    // its children. If the path cannot be resolved, get_child throws.
    // A C++11 for-range loop would also work.
    BOOST_FOREACH(pt::ptree::value_type &v, tree.get_child("debug.modules")) {
        // The data function is used to access the data stored in a node.
        m_modules.insert(v.second.data());
    }
#endif
}
