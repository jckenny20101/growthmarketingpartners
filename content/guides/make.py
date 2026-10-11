import json,copy,sys
sys.path.insert(0,'/tmp/claude-0/-home-user-growthmarketingpartners/8e41967e-da34-5741-a02d-a0003e9e4a73/scratchpad/build')
from gmpbuild import *
priv=load('page3-backup.json'); home=load('p14b.json')
cats={c['name']:c['id'] for c in json.load(open(S+'cats.json'))}
def build(g,date='October 11, 2026'):
    hero=copy.deepcopy(priv[0])
    text(find([hero],'6b0b91c8'),g['category'])
    text(find([hero],'eaee9db'),g['title'])
    text(find([hero],'2749577a'),date+' · '+g['read']+' · Growth Marketing Partners')
    pol=copy.deepcopy(priv[1]); inner=pol['elements'][0]; tmpl=copy.deepcopy(inner['elements'][1])
    head0=tmpl['elements'][0]; para0=tmpl['elements'][1]
    secs=[]
    def section(title,paras):
        s=copy.deepcopy(tmpl); h=copy.deepcopy(head0); text(h,title)
        ps=[]
        for t in paras:
            p=copy.deepcopy(para0); text(p,t); ps.append(p)
        s['elements']=[h]+ps; return s
    for t,ps in g['sections']: secs.append(section(t,ps))
    secs.append(section('Sources',['<strong>'+w+'.</strong> <a href="'+u+'" target="_blank" rel="noopener">'+x+'</a>' for w,x,u in g['sources']]+['More figures, each linked to its source, are on our <a href="/benchmarks/">benchmarks page</a>.']))
    inner['elements']=secs
    cta=copy.deepcopy(find(home,'69bcf5e6'))
    data=[restamp(hero),restamp(pol),restamp(cta)]
    a=ids(data); assert len(a)==len(set(a))
    return {"title":g['title'],"slug":g['slug'],"excerpt":g['excerpt'],"categories":[cats[g['category']]],"template":"elementor_header_footer",
            "meta":{"_elementor_edit_mode":"builder","_elementor_template_type":"wp-post","_elementor_data":json.dumps(data,separators=(',',':')),"_elementor_page_settings":{"hide_title":"yes","background_background":"classic","background_color":"#F4F1EA"}}}
if __name__=='__main__':
    for i in range(1,5):
        b=build(json.load(open(f'g{i}.json'))); b['status']=sys.argv[1] if len(sys.argv)>1 else 'draft'
        json.dump(b,open(f'post{i}.json','w'))
    print('built')
