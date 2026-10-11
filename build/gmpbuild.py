"""Helpers to build Elementor pages for growthmarketingpartners.ca by cloning existing sections."""
import json, copy, secrets, re
S='/tmp/claude-0/-home-user-growthmarketingpartners/8e41967e-da34-5741-a02d-a0003e9e4a73/scratchpad/'
def load(path): return json.loads(json.load(open(S+path))['meta']['_elementor_data'])
def find(n,i):
    for e in n:
        if e['id']==i: return e
        r=find(e.get('elements',[]),i)
        if r: return r
def E(t): return {"$$type":"escaped-html","value":t}
def U(u): return {"$$type":"link","value":{"destination":{"$$type":"url","value":u}}}
def text(e,t):
    s=e['settings']
    for k in ('paragraph','title','text'):
        if k in s: s[k]=E(t); return e
    raise KeyError(e['id'])
def restamp(el):
    def walk(e):
        e['id']=secrets.token_hex(4)
        st=e.get('styles') or {}
        if st:
            m={};ns={}
            for sid,s in st.items():
                nid='e-%s-%s'%(secrets.token_hex(4),secrets.token_hex(2)); m[sid]=nid
                s=copy.deepcopy(s); s['id']=nid; ns[nid]=s
            e['styles']=ns
            cl=e.get('settings',{}).get('classes')
            if cl: cl['value']=[m.get(c,c) for c in cl['value']]
        for c in e.get('elements',[]): walk(c)
    walk(el); return el
def by_title(root,title):
    """find descendant by editor title"""
    def walk(e):
        if (e.get('editor_settings') or {}).get('title')==title: return e
        for c in e.get('elements',[]):
            r=walk(c)
            if r: return r
    return walk(root)
_gc=None
def gclass(label):
    global _gc
    if _gc is None:
        t=json.load(open(S+'gclasses.json'))['result']['content'][0]['text']; g=json.loads(t); c=g.get('content',g)
        if isinstance(c,str): c=json.loads(c)
        _gc={}
        def collect(o):
            if isinstance(o,dict):
                if 'id' in o and 'label' in o and str(o['id']).startswith('g-'): _gc[o['label']]=o['id']
                for v in o.values(): collect(v)
            elif isinstance(o,list):
                for v in o: collect(v)
        collect(c)
    return _gc[label]
def swap_class(root,old,new):
    o=gclass(old); n=gclass(new) if new else None
    def walk(e):
        cl=e.get('settings',{}).get('classes')
        if cl and o in cl['value']:
            cl['value']=[x for x in cl['value'] if x!=o]+([n] if n else [])
        for c in e.get('elements',[]): walk(c)
    walk(root)
def set_color(e,var):
    for sid,s in (e.get('styles') or {}).items():
        for v in s.get('variants',[]):
            if v.get('props') and 'color' in v['props']: v['props']['color']={"$$type":"global-color-variable","value":var}
def ids(data):
    out=[]
    def walk(e):
        out.append(e['id']); [walk(c) for c in e.get('elements',[])]
    [walk(e) for e in data]; return out
