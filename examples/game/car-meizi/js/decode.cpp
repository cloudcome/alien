int decode(std::string &mixstr,std::string &str){
        std::vector<std::string> tmp;
        boost::split(tmp, mixstr, boost::is_any_of("."));
        if(tmp.size()==2){
                int index = atoi(tmp[1].c_str());
                int f_start = 2;
                int f_end = index;
 
                int s_start = index + 2 + 13;
                int s_end = 32 - index;
                str = mixstr.substr(f_start,f_end) + mixstr.substr(s_start,s_end);
        }
        if(tmp.size()==1){
                mid = tmp[0];
        }
} 