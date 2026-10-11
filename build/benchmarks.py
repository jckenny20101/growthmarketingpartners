import json, copy, sys
sys.path.insert(0,'.')
from gmpbuild import *
home=load('p14b.json'); priv=load('page3-backup.json')
SIGNAL_INK='e-gv-27fe43a'; INK3='e-gv-88538e3'

# hero from the privacy page
hero=copy.deepcopy(priv[0])
text(find([hero],'6b0b91c8'),'Benchmarks')
text(find([hero],'eaee9db'),'The numbers behind B2B pipeline in 2026.')
text(find([hero],'2749577a'),'Last checked: October 2026 · every figure links to its source')

SECTIONS=[
 ('How buyers buy','They decide before they call, and they start with AI.',[
   ('94%','Buyers pick before they call','of B2B buying groups have ranked their preferred vendors before first contact with a seller, and they buy from that favourite 77% of the time.','6sense, 2025 Buyer Experience Report'),
   ('51%','AI is the new front door','of B2B software buyers now start research with an AI chatbot more often than with Google, up from 29% a year earlier.','G2, April 2026 survey of 1,076 buyers'),
   ('22','More people in every deal','people influence a typical purchase: 13 inside the buying company and 9 outside it, such as consultants, peers and analysts.','Forrester, The State of Business Buying 2026'),
   ('78%','Uncertainty kills good deals','Buyers with moderate to high uncertainty are 78% less likely to complete a high-quality deal.','Gartner, 2024')],
  'Positioning now has to win in AI answers and on review sites before a seller is in the room. Our <a href="/services/segments-icp/">segments and positioning</a> work starts there.'),
 ('Winning deals','Most deals are lost to indecision, not competitors.',[
   ('19%','Average new-logo win rate','of new-business opportunities are won on average. Expansion deals with existing customers close at 45%.','Ebsta and Pavilion, 2025 GTM Benchmarks (655,000 opportunities)'),
   ('+55%','Bring decision makers in early','higher win rates when decision makers take part in the first two stages of a deal.','Ebsta and Pavilion, 2025 GTM Benchmarks'),
   ('40–60%','No decision is the real competitor','of qualified deals end with the buyer deciding nothing, according to an analysis of 2.5 million recorded sales conversations.','Dixon and McKenna, The JOLT Effect'),
   ('45%','Expansion closes more often','win rate on expansion deals, more than twice the new-logo rate, which is why existing customers belong in the pipeline target.','Ebsta and Pavilion, 2025 GTM Benchmarks')],
  'Score your live deals with the <a href="/services/segments-icp/#gt-nodecision">no-decision risk scorecard</a>, or see where your funnel leaks with the <a href="/services/pipeline-programs/#gt-funnel">funnel leak finder</a>.'),
 ('Efficiency','Growth costs more, and boards are watching the payback.',[
   ('$2.00','Cost of $1 of new revenue','in sales and marketing to win $1 of new-customer ARR at the median B2B SaaS company, up 14% in a year.','Benchmarkit, 2025 SaaS Performance Metrics'),
   ('16–20','Months to pay back CAC','is the median CAC payback period for private B2B SaaS, depending on the year and dataset, up from a historical 12 to 14 months.','Benchmarkit 2025; Aleph and Benchmarkit 2026'),
   ('22%','Median growth rate','for private B2B SaaS companies in 2025, down from 25% in 2024. Bootstrapped companies grew 20%, equity-backed 25%.','SaaS Capital, 2026 benchmarks (1,000+ companies)'),
   ('101%','Median net revenue retention','with gross revenue retention at 88% and slipping. Companies with the highest retention grow far faster than the median.','Benchmarkit 2025; SaaS Capital 2026')],
  'See how your numbers compare with the <a href="/services/go-to-market-diagnostic/#gt-efficiency">SaaS efficiency benchmark</a>, or check payback by channel with the <a href="/services/pipeline-programs/#gt-cac">CAC payback calculator</a>.'),
 ('Pricing','Per-seat pricing is giving way to hybrid models and AI credits.',[
   ('37%','Hybrid is now the most common model','of B2B software companies use hybrid pricing as their main model, up from 25% a year earlier. Seat-based and flat fees are expected to shrink sharply.','Growth Unhinged, 2026 State of B2B Monetization (230+ companies)'),
   ('29%','AI credits are spreading','already price AI with credits or tokens, and another 33% plan to within six to twelve months.','Growth Unhinged, 2026 State of B2B Monetization'),
   ('~50%','AI margins run thinner','is the median gross margin target for AI products, against the 70 to 80% typical of software.','Growth Unhinged, 2026 State of B2B Monetization'),
   ('92%','Usage pricing holds customers','gross revenue retention under usage-based pricing, against 88% under subscription and hybrid models.','Benchmarkit, 2025 SaaS Performance Metrics')],
  'Find the right model with the <a href="/services/pricing-packaging/#gt-pricemodel">pricing model selector</a>, and check what AI features do to your margin with the <a href="/services/pricing-packaging/#gt-aimargin">AI margin calculator</a>.'),
 ('Fintech onboarding','Slow onboarding is costing more clients every year.',[
   ('70%','Institutions losing clients','of financial institutions lost clients to slow or inefficient onboarding in 2025, up from 67% in 2024 and 48% in 2023.','Fenergo, 2025 survey of 600 decision-makers'),
   ('68%','Consumers who gave up','of consumers have abandoned a financial onboarding process at least once.','Signicat, The Battle to Onboard'),
   ('19 min','The patience window','is roughly when people give up: the average abandonment happens at 18 minutes and 53 seconds.','Signicat, The Battle to Onboard'),
   ('21%','Three reasons tie at the top','of people cite each of these: it took too long, it asked for too much personal information, or they changed their mind.','Signicat, The Battle to Onboard')],
  'Score your own flow with the <a href="/industries/fintech/#gt-friction">onboarding friction audit</a>, and see what a better funnel is worth with the <a href="/industries/fintech/#gt-onboarding">onboarding calculator</a>.'),
]
SOURCES=[
 ('6sense','2025 B2B Buyer Experience Report','https://6sense.com/report/buyer-experience/'),
 ('G2','New G2 Research: Half of B2B Software Buyers Now Start Their Research With AI Chatbots (April 2026)','https://company.g2.com/news/buyer-behavior-2026'),
 ('Forrester','The State of Business Buying, 2026, as reported by Digital Commerce 360','https://digitalcommerce360.com/2026/01/22/forrester-b2b-buying-ai-2026/'),
 ('Gartner','Insights abstract on buyer uncertainty and deal quality (2024)','https://www.gartner.com/en/documents/5088931'),
 ('Ebsta and Pavilion','2025 GTM Benchmarks','https://benchmarks.ebsta.com/2025-gtm-benchmarks'),
 ('Matthew Dixon and Ted McKenna','The JOLT Effect (Portfolio, 2022)','https://www.penguin.com.au/books/the-jolt-effect-9780593538111'),
 ('Benchmarkit','2025 B2B SaaS Performance Metrics Benchmarks','https://www.benchmarkit.ai/2025benchmarks'),
 ('Aleph','CAC payback period benchmarks for SaaS (2026), with Benchmarkit data','https://www.getaleph.com/answers/cac-payback-period-saas-2026'),
 ('SaaS Capital','2026 Private B2B SaaS Company Growth Rate Benchmarks','https://www.saas-capital.com/research/private-saas-company-growth-rate-benchmarks/'),
 ('Growth Unhinged (Kyle Poyar)','The 2026 State of B2B SaaS and AI Monetization Report','https://www.growthunhinged.com/p/the-state-of-b2b-monetization-in-2026'),
 ('Fenergo','Global financial institutions struggle with rising client losses (October 2025)','https://resources.fenergo.com/newsroom/global-financial-institutions-struggle-with-rising-client-losses-and-compliance-costs-as-ai-adoption-increases-fenergo'),
 ('Signicat','The Battle to Onboard','https://www.signicat.com/the-battle-to-onboard'),
]
tmpl=find(home,'7d4d0d87')
body=[]
for n,(eye,title,stats,note) in enumerate(SECTIONS):
    s=copy.deepcopy(tmpl)
    text(find([s],'17662aed'),eye); text(find([s],'676a8b22'),title)
    for i,(rid,(v,t,b,src)) in enumerate(zip(['2f393412','7aaca945','3f9bed9e','34246255'],stats)):
        r=find([s],rid); kids=r['elements']
        text(kids[0],v); text(kids[1],t); text(kids[2],b); text(kids[3],src)
    text(find([s],'36f6d275'),note)
    if n%2==1:  # alternate light sections
        swap_class(s,'gc-band-inverse','gc-band-sunken'); swap_class(s,'gc-on-inverse',None); swap_class(s,'gc-inverse-muted',None)
        for rid in ['2f393412','7aaca945','3f9bed9e','34246255']:
            r=find([s],rid); set_color(r['elements'][0],SIGNAL_INK); set_color(r['elements'][3],INK3)
        set_color(find([s],'17662aed'),INK3)
    s.setdefault('editor_settings',{})['title']='Bench: '+eye
    body.append(restamp(s))
# sources: clone the privacy policy body with one section
pol=copy.deepcopy(priv[1]); inner=pol['elements'][0]; sec=copy.deepcopy(inner['elements'][1])  # P2 has several paragraphs
head=sec['elements'][0]; para=sec['elements'][1]
text(head,'Sources')
paras=[copy.deepcopy(para)]
text(paras[0],'We use third-party research only, link every figure to its source and check the numbers each quarter. Where sources disagree, we show the range. Research methods differ, so treat these as context for your own data, not targets.')
for who,what,url in SOURCES:
    p=copy.deepcopy(para); text(p,'<strong>'+who+'.</strong> <a href="'+url+'" target="_blank" rel="noopener">'+what+'</a>'); paras.append(p)
sec['elements']=[head]+paras
inner['elements']=[sec]
pol.setdefault('editor_settings',{})['title']='Bench: sources'
body.append(restamp(pol))
cta=restamp(copy.deepcopy(find(home,'69bcf5e6')))
data=[restamp(hero)]+body+[cta]
allids=ids(data); assert len(allids)==len(set(allids))
json.dump(data,open('benchmarks_data.json','w'))
p=json.load(open(S+'page3-backup.json'))
print('elements',len(allids))
