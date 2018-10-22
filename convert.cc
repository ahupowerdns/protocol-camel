#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/xml_parser.hpp>
#include <boost/foreach.hpp>
#include <boost/algorithm/string.hpp>
#include <boost/multi_index_container.hpp>
#include <boost/multi_index/ordered_index.hpp>
#include <boost/multi_index/key_extractors.hpp>
#include <unordered_map>
using namespace ::boost::multi_index;
#include <string>
#include <set>
#include <exception>
#include <iostream>
#include <fstream>
#include <unordered_set>
#include <map>
#include "nlohmann/json.hpp"

namespace pt = boost::property_tree;

using namespace std;

struct RFCEntry
{
  std::string name;
  time_t creation;
  set<std::string> obsoletes;
  set<std::string> obsoletedBy;
  string title;  

  string currentStatus;
  int pages{0};
};

struct NameTag{};
struct TimeTag{};

typedef multi_index_container<
  RFCEntry,
  indexed_by<
    ordered_non_unique<
      tag<TimeTag>,
      member<RFCEntry, time_t, &RFCEntry::creation> 
      >,
  ordered_unique<
    tag<NameTag>,
    member<RFCEntry, std::string, &RFCEntry::name>
    >
    >
  > index_t;
index_t g_index;


int main(int argc, char** argv)
{
  ifstream dnsrfcsfile("dns-rfcs.json");
  nlohmann::json dnsrfcsJS;
  dnsrfcsfile >> dnsrfcsJS;

  std::unordered_map<string, unordered_set<string>> dnsrfcs;
  for(auto iter = dnsrfcsJS.begin() ; iter != dnsrfcsJS.end(); ++iter) {
    cout << iter.key() << endl;
    for(const auto& s : iter.value()["sections"])
      dnsrfcs[boost::to_upper_copy(iter.key())].insert(s.get<string>());
  }
  cout<<"Have "<<dnsrfcs.size()<<" RFCs whitllisted for DNS"<<endl;
  
  // Create empty property tree object
  pt::ptree tree;
  
  // Parse the XML into the property tree.
  pt::read_xml(argv[1], tree);
  
  auto idx=tree.get_child("rfc-index");
  int count=0;

  for(const auto& v : idx) {
    if(v.first=="rfc-entry") {
      RFCEntry re;
      re.name = v.second.get_child("doc-id").data();

      if(!dnsrfcs.count(re.name)) {
        //        cout << "Ignoring "<<re.name<<", not a DNS rfc"<<endl;
        continue;
      }
      if(!dnsrfcs[re.name].count("core"))
        continue;
      re.title = v.second.get_child("title").data();
      re.currentStatus=v.second.get_child("current-status").data();

      count++;

      if(v.second.count("obsoleted-by")) {
        for(const auto obs : v.second.get_child("obsoleted-by")) {
          re.obsoletedBy.insert(obs.second.data());
          if(!dnsrfcs.count(obs.second.data())) {
            cerr<<re.name<<" " <<re.title<<" is obsoleted by "<< obs.second.data()<< " which itself is not a DNS RFC!" <<endl;
          }
        }
      }
      if(v.second.count("obsoletes")) {
        for(const auto obs : v.second.get_child("obsoletes")) {
          re.obsoletes.insert(obs.second.data());
          if(!dnsrfcs.count(obs.second.data())) {
            cerr<<re.name<<" " <<re.title<<" obsoletes"<< obs.second.data()<< " which itself is not a DNS RFC!" <<endl;
          }
        }
      }

      if(v.second.count("updated-by")) {
        for(const auto obs : v.second.get_child("updated-by")) {
          re.obsoletedBy.insert(obs.second.data());
          if(!dnsrfcs.count(obs.second.data())) {
            cerr<<re.name<<" " <<re.title<<" is updated by "<< obs.second.data()<< " which itself is not a DNS RFC!" <<endl;
          }
        }
      }


      if(v.second.get_child("format").count("page-count")) {
        re.pages = atoi(v.second.get_child("format.page-count").data().c_str());

        string date = v.second.get_child("date.month").data();
        date+=" ";
        date +=v.second.get_child("date.year").data();
        
        struct tm tm;
        memset(&tm, 0, sizeof(tm));
        tm.tm_mday = 1;
        strptime(date.c_str(), "%B %Y", &tm);
        re.creation = mktime(&tm);
      }
      g_index.insert(re);
    }
  }
  cout<<"Have "<<g_index.size()<<" DNS RFCs"<<endl;
  std::map<string, int> statusPageCount;
  statusPageCount["OBSOLETED"];
  for(const auto& re : g_index) {
    statusPageCount[re.currentStatus];
    cout << re.name << endl;
  }
  ofstream plot("plot");
  plot << "# TIME";
  for(const auto& spc : statusPageCount)
    plot << '\t' << spc.first;
  plot << "\n";

  set<string> dedup;
  // this is in time order
  for(const auto& re : g_index) {
    plot << re.creation;
    statusPageCount[re.currentStatus] += re.pages;
    cout << re.name << " ["<<re.currentStatus<<"] appears, "<< re.title<<endl;
    auto& idx = g_index.get<NameTag>();
    for(const auto& obsoletes : re.obsoletes) {
      cout << "\tIt obsoletes "<<obsoletes<<endl;

      if(auto iter = idx.find(obsoletes); iter != idx.end()) {
        if(!dedup.count(iter->name)) {
          statusPageCount[iter->currentStatus] -= iter->pages;
          statusPageCount["OBSOLETED"] += iter->pages;
          dedup.insert(iter->name);
        }
        else {
          cout << re.name <<" tried to re-obsolete "<< iter-> name << endl;
        }
      }
      else {
        cerr<< re.name<<": could not find the thing it obsoletes: "<< obsoletes << endl;
      }
    }
    
    for(const auto& spc : statusPageCount)
      plot << '\t' << spc.second;

    plot <<" # "<< re.name;
    for(const auto& obsoletes : re.obsoletes) {
      plot << "\t-"<<obsoletes;
    }
    
    plot << "\n";
  }
#if 0

  int bcppages{0}, infopages{0}, exppages{0}, stdpages{0}, histopages{0}, otherpages{0}, obsopages{0};

    cout << "{";
        if(count)
        cout<<",\n";


      cout << '"' << re.name << "\": {";
      cout << "\"docID\": \"" << re.name << "\",";

      boost::replace_all(re.title, "\\", "\\\\");
      boost::replace_all(re.title, "\"", "\\\"");
      cout << "\"title\": \"" << re.title << "\", ";
      cout << "\"currentStatus\": \"" << re.currentStatus << "\",";
      cout << "\"pages\": " << re.pages << ",";
      if(!re.obsoletedBy.empty()) {
        cout << "\"obsoleted\": 1"<<",";
      }
      else
        cout << "\"obsoleted\": 0"<<",";
      else
        cout << "\"pages\": 0,";

      cout << "\"draft\": 0";
      cout << "}";
          
          plot << mktime(&tm) << "\t" <<dnscount << "\t" << stdpages << "\t" << infopages << "\t" << exppages<<"\t" << histopages << "\t" << bcppages << "\t" << otherpages << "\t" << obsopages << endl;
  
  cout << "}"<<endl;
  #endif
}
