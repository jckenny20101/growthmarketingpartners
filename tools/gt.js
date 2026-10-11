(function(){
  // GMP website tools. Each tool is injected after (or inside) an Elementor element on its page,
  // asks for name and work email before showing results, and emails the results through the
  // "Website tools" form (page 284, kept as a draft) so leads land in Elementor > Submissions.
  var FORM={post:284, id:'5bffcb2a', name:'Website tools'};
  var STORE='gmpToolsContact';

  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(v){
    var a=Math.abs(v), s=v<0?'-':'', r;
    if(a>=1e9) r=(a/1e9).toFixed(a>=1e10?0:1)+'B';
    else if(a>=1e6) r=(a/1e6).toFixed(a>=1e7?0:1)+'M';
    else if(a>=1e3) r=Math.round(a/1e3)+'K';
    else r=Math.round(a).toString();
    return s+'$'+r.replace(/\.0(?=[BMK])/,'');
  }
  function pct(v,d){ return (Math.round(v*Math.pow(10,d||0))/Math.pow(10,d||0)).toLocaleString('en-US')+'%'; }
  function num(v){ return Math.round(v).toLocaleString('en-US'); }
  function months(v){ return v>=100?'over 8 years':(Math.round(v*10)/10)+(Math.round(v*10)/10===1?' month':' months'); }
  function list(a){ return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]; }
  function store(){ try{ return JSON.parse(localStorage.getItem(STORE)||'{}'); }catch(e){ return {}; } }
  function save(o){ try{ localStorage.setItem(STORE,JSON.stringify(o)); }catch(e){} }

  // ---------- shared field helpers ----------
  function field(key,label,value,opts){
    opts=opts||{};
    return '<div class="gt-field"><label for="'+key+'">'+esc(label)+'</label><input type="number" inputmode="decimal" id="'+key+'" data-k="'+key.split('-').pop()+'" value="'+value+'" min="'+(opts.min!=null?opts.min:0)+'"'+(opts.max!=null?' max="'+opts.max+'"':'')+' step="any"></div>';
  }
  function val(card,k){ var i=card.querySelector('[data-k="'+k+'"]'); return i?parseFloat(i.value):NaN; }
  function textval(card,k){ var i=card.querySelector('[data-k="'+k+'"]'); return i?i.value.trim():''; }
  function need(cond,msg){ if(!cond) throw new Error(msg); }
  function summary(card){
    var out=[];
    [].forEach.call(card.querySelectorAll('.gt-form input'),function(i){
      if(i.type==='radio'){ if(i.checked) out.push(i.getAttribute('data-q')+': '+i.getAttribute('data-l')); return; }
      var l=card.querySelector('label[for="'+i.id+'"]'), lab=l?l.textContent:(i.getAttribute('aria-label')||i.id);
      if(i.value!=='') out.push(lab+': '+i.value);
    });
    return out.join(' · ');
  }
  function rowTable(prefix,rows,cols){
    var h='<div class="gt-scroll"><table class="gt-table"><thead><tr><th class="gt-th">'+esc(cols[0])+'</th>';
    cols.slice(1).forEach(function(c){ h+='<th class="gt-th" scope="col">'+esc(c.label)+'</th>'; });
    h+='</tr></thead><tbody>';
    rows.forEach(function(r,ri){
      h+='<tr>';
      if(r.editableName) h+='<td><input type="text" id="'+prefix+'-n'+ri+'" data-k="n'+ri+'" value="'+esc(r.name)+'" aria-label="'+esc(cols[0])+' '+(ri+1)+' name"></td>';
      else h+='<td class="gt-rowname">'+esc(r.name)+'</td>';
      cols.slice(1).forEach(function(c,ci){
        var k=c.k+ri;
        h+='<td><input type="number" inputmode="decimal" step="any" min="0" id="'+prefix+'-'+k+'" data-k="'+k+'" value="'+(r.v[ci]==null?'':r.v[ci])+'" aria-label="'+esc(r.name+' '+c.label)+'"></td>';
      });
      h+='</tr>';
    });
    return h+'</tbody></table></div>';
  }

  // ---------- the tools ----------
  var AREAS=['Funnel','Segments','Messaging','Pricing','Channels','Forecast'];
  var QUIZ=[
    ['Funnel','We know our conversion rate at every step from first touch to closed-won.'],
    ['Funnel','We know which step in the funnel loses us the most revenue.'],
    ['Segments','We can name the two or three segments where we win most often.'],
    ['Segments','Sales and marketing spend most of their time on those segments.'],
    ['Messaging','Our messaging comes from what buyers said in win-loss interviews.'],
    ['Messaging','A prospect could explain how we differ from the alternative in one sentence.'],
    ['Pricing','Reps rarely need a discount to close a deal.'],
    ['Pricing','Our packages fit how our buyers approve and sign for spend.'],
    ['Channels','We know the cost per qualified opportunity for each channel.'],
    ['Channels','We move budget based on what the next dollar buys, not the average.'],
    ['Forecast','Every rep uses the same written definitions for each pipeline stage.'],
    ['Forecast','Last quarter’s forecast landed within 10 percent of the actual number.']
  ];
  var SCALE=['Strongly disagree','Disagree','Not sure','Agree','Strongly agree'];
  var ADVICE={
    Funnel:'You can’t fix what you can’t see. Measure conversion at every step from first touch to closed-won, then work on the step that loses the most revenue.',
    Segments:'Effort is spread across buyers who don’t all convert. Score each segment on win rate, deal size, sales cycle and payback, then put budget and sales time into the best two or three.',
    Messaging:'Buyers can’t easily tell you apart. Rebuild the message from win-loss interviews and test it before anyone rewrites the website.',
    Pricing:'Discounting and package friction are likely costing you. Clear discount bands and packages that match how buyers approve spend usually pay back fastest.',
    Channels:'Budget is following averages instead of the next dollar. Track cost per qualified opportunity by channel and scale only where the marginal cost holds.',
    Forecast:'The forecast can’t be trusted until stages mean the same thing to every rep. Write down stage definitions and exit criteria first.'
  };

  var TOOLS=[
  { key:'quiz', name:'Go-to-market health check', anchor:'37eb8e98', where:'after',
    eyebrow:'Free health check', h2:'Where is your pipeline leaking?',
    lede:'Twelve statements, about two minutes. Score each one honestly and we’ll show you which of the six areas is most likely holding pipeline back.',
    tag:'Health check', title:'How much do you agree with each statement?', button:'See my score',
    form:function(id){
      var h='<div class="gt-qs">';
      QUIZ.forEach(function(q,i){
        h+='<fieldset class="gt-q"><legend><small>'+esc(q[0])+'</small>'+esc(q[1])+'</legend><div class="gt-scale">';
        SCALE.forEach(function(s,v){ h+='<label><input type="radio" name="'+id+'-q'+i+'" value="'+v+'" data-q="Q'+(i+1)+'" data-l="'+esc(s)+'"><span>'+esc(s)+'</span></label>'; });
        h+='</div></fieldset>';
      });
      return h+'</div>';
    },
    compute:function(card){
      var sc={}; AREAS.forEach(function(a){ sc[a]=0; });
      QUIZ.forEach(function(q,i){
        var c=card.querySelector('input[name$="-q'+i+'"]:checked');
        need(c,'Please answer all twelve statements (question '+(i+1)+' is missing).');
        sc[q[0]]+=parseInt(c.value,10);
      });
      var list=AREAS.map(function(a){ return {a:a,s:Math.round(sc[a]/8*100)}; });
      var overall=Math.round(list.reduce(function(t,x){ return t+x.s; },0)/list.length);
      var sorted=list.slice().sort(function(x,y){ return x.s-y.s; });
      var low=sorted[0];
      var bars='<div class="gt-bars">'+list.map(function(x){ return '<div class="gt-bar'+(x.a===low.a?' gt-low':'')+'"><span>'+x.a+'</span><i><b style="width:'+x.s+'%"></b></i><span>'+x.s+'</span></div>'; }).join('')+'</div>';
      return { hlabel:'Your likely constraint', headline:low.a, small:true,
        rows:[['Overall score',overall+' / 100'],['Lowest area',low.a+' ('+low.s+')'],['Next lowest',sorted[1].a+' ('+sorted[1].s+')'],['Strongest area',sorted[5].a+' ('+sorted[5].s+')'],['All six areas',list.map(function(x){ return x.a+' '+x.s; }).join(' · ')]],
        extra:bars, insight:ADVICE[low.a] };
    }
  },
  { key:'funnel', name:'Funnel leak finder', anchor:'1941beab', where:'after',
    eyebrow:'Funnel leak finder', h2:'Which step is losing you the most revenue?',
    lede:'Enter a typical month. We compare each step with a target and show what closing the gap at that one step would be worth in a year. Edit the targets to match your own.',
    tag:'Calculator', title:'Your funnel in a typical month', button:'Find my leak',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-v','Website visits',20000)+field(id+'-r','Demo requests',300)+field(id+'-m','Meetings held',180)+field(id+'-q','Qualified opportunities',90)+field(id+'-w','Closed-won deals',18)+field(id+'-a','Average first-year deal ($K)',40)+'</div>'
        +'<p class="gt-sub">Targets (%)</p><div class="gt-grid">'+field(id+'-t1','Visit to demo request',2,{max:100})+field(id+'-t2','Request to meeting held',70,{max:100})+field(id+'-t3','Meeting to qualified',50,{max:100})+field(id+'-t4','Qualified to closed-won',25,{max:100})+'</div>';
    },
    compute:function(card){
      var c=[val(card,'v'),val(card,'r'),val(card,'m'),val(card,'q'),val(card,'w')], A=val(card,'a')*1000;
      c.forEach(function(x){ need(x>0,'Enter a number above zero for every step.'); });
      need(A>0,'Enter your average first-year deal size.');
      for(var i=1;i<5;i++) need(c[i]<=c[i-1],'Each step should be smaller than the one before it.');
      var names=['Visit to demo request','Request to meeting held','Meeting to qualified','Qualified to closed-won'];
      var steps=names.map(function(n,i){
        var rate=c[i+1]/c[i]*100, t=val(card,'t'+(i+1));
        need(t>0&&t<=100,'Targets must be between 0 and 100.');
        var gain=rate<t?c[4]*(t/rate-1)*12*A:0;
        return {n:n,rate:rate,t:t,gain:gain};
      });
      var worst=steps.slice().sort(function(x,y){ return y.gain-x.gain; })[0];
      var rows=steps.map(function(s){ return [s.n+': '+pct(s.rate,1)+' (target '+pct(s.t,1)+')', s.gain>0?'+'+money(s.gain)+' a year at target':'At or above target']; });
      rows.push(['Closed-won deals a year', num(c[4]*12)+' ('+money(c[4]*12*A)+')']);
      if(worst.gain<=0) return {hlabel:'Every step is at or above target', headline:'No leak found', small:true, rows:rows,
        insight:'Your conversion holds up at every step against these targets. The next lever is volume or deal size, or tighter targets.'};
      return {hlabel:'Revenue lost at your worst step: '+worst.n, headline:money(worst.gain)+' a year', rows:rows,
        insight:'Fix '+worst.n.toLowerCase()+' first. Moving it from '+pct(worst.rate,1)+' to '+pct(worst.t,1)+' would add about '+num(worst.gain/A)+' deals a year without spending more on leads.'};
    }
  },
  { key:'segments', name:'Segment scorecard', anchor:'49d7735b', where:'after',
    eyebrow:'Segment scorecard', h2:'Score your own segments on the same four things.',
    lede:'Add up to four segments. We rank them on win rate, deal size, sales cycle and payback, and show which one earns the budget and sales time.',
    tag:'Calculator', title:'Your segments', button:'Rank my segments',
    form:function(id){
      return rowTable(id,[
          {name:'Mid-market',editableName:true,v:[30,45,60,12]},
          {name:'Enterprise',editableName:true,v:[18,140,150,45]},
          {name:'Small business',editableName:true,v:[35,12,25,6]},
          {name:'',editableName:true,v:[null,null,null,null]}],
          ['Segment',{label:'Win rate (%)',k:'w'},{label:'First-year deal ($K)',k:'a'},{label:'Sales cycle (days)',k:'c'},{label:'Cost to win a deal ($K)',k:'x'}])
        +'<div class="gt-grid">'+field(id+'-gm','Gross margin (%)',80,{max:100})+'</div>';
    },
    compute:function(card){
      var gm=val(card,'gm')/100; need(gm>0&&gm<=1,'Enter a gross margin between 0 and 100.');
      var segs=[];
      for(var i=0;i<4;i++){
        var n=textval(card,'n'+i), w=val(card,'w'+i), a=val(card,'a'+i), c=val(card,'c'+i), x=val(card,'x'+i);
        if(!n && isNaN(w) && isNaN(a)) continue;
        need(n,'Give segment '+(i+1)+' a name.');
        need(w>0&&w<=100&&a>0&&c>0&&x>=0,'Fill in every number for '+n+'.');
        segs.push({n:n,w:w,a:a,c:c,x:x,vel:w/100*a*365/c,pay:x/(a*gm/12)});
      }
      need(segs.length>=2,'Enter at least two segments to compare.');
      function rank(key,asc){ var s=segs.slice().sort(function(p,q){ return asc?p[key]-q[key]:q[key]-p[key]; }); s.forEach(function(g,i){ g['r'+key]=i+1; }); }
      rank('w'); rank('a'); rank('c',true); rank('pay',true);
      segs.forEach(function(g){ g.score=(g.rw+g.ra+g.rc+g.rpay)/4; });
      segs.sort(function(p,q){ return p.score-q.score || q.vel-p.vel; });
      var best=segs[0], worst=segs[segs.length-1];
      var table='<table class="gt-rank"><thead><tr><th>Rank</th><th>Segment</th><th>Revenue per opportunity a year</th><th>Payback</th></tr></thead><tbody>'
        +segs.map(function(g,i){ return '<tr'+(i===0?' class="gt-top1"':'')+'><td>'+(i+1)+'</td><td>'+esc(g.n)+'</td><td>'+money(g.vel*1000)+'</td><td>'+months(g.pay)+'</td></tr>'; }).join('')+'</tbody></table>';
      var rows=segs.slice(0,4).map(function(g,i){ return ['#'+(i+1)+' '+g.n, g.w+'% win · '+money(g.a*1000)+' deal · '+g.c+' days · payback '+months(g.pay)]; });
      while(rows.length<4) rows.push(['','']);
      rows.push(['Revenue per opportunity a year (best vs lowest)', money(best.vel*1000)+' vs '+money(worst.vel*1000)]);
      var ratio=best.vel/worst.vel;
      return {hlabel:'Where the budget and sales time should go', headline:best.n, small:true, rows:rows, extra:table,
        insight:best.n+' ranks first across the four measures. Once you allow for cycle length, each qualified opportunity there is worth about '+(Math.round(ratio*10)/10)+'× one in '+worst.n+'.'};
    }
  },
  { key:'discount', name:'Discount leakage calculator', anchor:'2a5401cf', where:'after',
    eyebrow:'Discount leakage', h2:'How much are discounts really costing you?',
    lede:'Most teams know their average discount. Few know what it adds up to, or that renewals usually inherit it.',
    tag:'Calculator', title:'Your deals in a typical year', button:'Calculate my leakage',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-d','New deals a year',80)+field(id+'-l','Average list price, first year ($K)',50)+field(id+'-p','Average discount (%)',25,{max:100})+field(id+'-t','Tighten the average by (points)',5,{max:100})+field(id+'-g','Gross revenue retention (%)',90,{max:100})+'</div>';
    },
    compute:function(card){
      var d=val(card,'d'), l=val(card,'l')*1000, p=val(card,'p'), t=val(card,'t'), g=val(card,'g')/100;
      need(d>0&&l>0,'Enter your deals per year and average list price.');
      need(p>=0&&p<100,'Enter an average discount between 0 and 100.');
      need(t>=0&&t<=p,'The tightening can’t be bigger than the discount itself.');
      need(g>0&&g<=1.5,'Enter gross revenue retention as a percentage, such as 90.');
      var given=d*l*p/100, rec=d*l*t/100, three=rec*(1+g+g*g);
      return {hlabel:'Given away in discounts each year', headline:money(given),
        rows:[['Average discount',pct(p,1)],['List value of new deals a year',money(d*l)],['Recovered by tightening '+t+' points',money(rec)+' a year'],['Over 3 years, as renewals keep the price',money(three)],['Deals needed to make that up at today’s discount',num(rec/(l*(1-p/100)))+' extra deals']],
        insight:'Tightening the average discount by '+t+' points is worth about '+money(rec)+' in the first year and '+money(three)+' over three years. Clear discount bands, with approval above them, usually get there without losing deals.'};
    }
  },
  { key:'price', name:'Price increase simulator', anchor:'798bd72e', where:'after',
    eyebrow:'Price increase simulator', h2:'Will a price increase pay for itself?',
    lede:'Enter the increase you’re considering and how many customers you might lose because of it. We show the net effect and how much churn you could absorb before it stops paying.',
    tag:'Calculator', title:'Your customers today', button:'Run the numbers',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-c','Customers',400)+field(id+'-r','Average annual revenue per customer ($K)',24)+field(id+'-i','Price increase (%)',8,{max:500})+field(id+'-l','Customers lost because of it (%)',3,{max:100})+'</div>';
    },
    compute:function(card){
      var c=val(card,'c'), r=val(card,'r')*1000, i=val(card,'i')/100, l=val(card,'l')/100;
      need(c>0&&r>0,'Enter your customer count and average revenue.');
      need(i>0,'Enter the price increase you’re considering.');
      need(l>=0&&l<1,'Enter the share of customers you might lose, between 0 and 100.');
      var now=c*r, after=c*(1-l)*r*(1+i), ch=after-now, be=i/(1+i)*100;
      var ok=ch>=0;
      return {hlabel:'Net change in annual revenue', headline:(ok?'+':'')+money(ch),
        rows:[['Annual revenue today',money(now)],['After the increase',money(after)],['Customers lost',num(c*l)+' of '+num(c)],['Break-even customer loss',pct(be,1)],['Verdict',ok?'Pays for itself':'Costs more than it earns']],
        insight:ok?'At '+pct(i*100,1)+' you could lose up to '+pct(be,1)+' of customers before the increase stops paying. Rolling it out at renewal, with a package that adds value, usually keeps losses well below that.'
          :'At this level of churn the increase loses money. A smaller increase, or one tied to a new package or value metric, is usually safer than raising list price across the board.'};
    }
  },
  { key:'cac', name:'CAC payback by program', anchor:'68a3567f', where:'after',
    eyebrow:'CAC payback', h2:'How fast does each program pay back?',
    lede:'Enter a quarter of spend and new customers for each program. We show cost to acquire, months to pay it back and lifetime value against cost.',
    tag:'Calculator', title:'Spend and new customers last quarter', button:'Compare my programs',
    form:function(id){
      return rowTable(id,[{name:'Paid',v:[60,6]},{name:'Outbound',v:[45,5]},{name:'Partners',v:[20,3]},{name:'Content',v:[25,2]}],
          ['Program',{label:'Spend ($K)',k:'s'},{label:'New customers',k:'n'}])
        +'<div class="gt-grid">'+field(id+'-a','Average first-year deal ($K)',30)+field(id+'-gm','Gross margin (%)',80,{max:100})+field(id+'-ch','Annual churn (%)',12,{max:100})+'</div>';
    },
    compute:function(card){
      var A=val(card,'a')*1000, gm=val(card,'gm')/100, ch=val(card,'ch')/100;
      need(A>0,'Enter your average first-year deal size.');
      need(gm>0&&gm<=1,'Enter a gross margin between 0 and 100.');
      need(ch>0&&ch<=1,'Enter annual churn above zero, such as 12.');
      var names=['Paid','Outbound','Partners','Content'], progs=[], S=0, N=0;
      names.forEach(function(n,i){
        var s=val(card,'s'+i)*1000, k=val(card,'n'+i);
        if(!(s>0)) return;
        S+=s; N+=(k>0?k:0);
        var cac=k>0?s/k:Infinity;
        progs.push({n:n,cac:cac,pay:cac/(A*gm/12),ltv:A*gm/ch/cac,k:k});
      });
      need(progs.length,'Enter spend for at least one program.');
      need(N>0,'Enter new customers for at least one program.');
      var bcac=S/N, bpay=bcac/(A*gm/12), bltv=A*gm/ch/bcac;
      var withC=progs.filter(function(p){ return p.k>0; }).sort(function(p,q){ return p.pay-q.pay; });
      var rows=names.map(function(n){
        var p=progs.filter(function(x){ return x.n===n; })[0];
        if(!p) return [n,'No spend entered'];
        if(!(p.k>0)) return [n,'No customers yet'];
        return [n,'CAC '+money(p.cac)+' · payback '+months(p.pay)+' · LTV:CAC '+(Math.round(p.ltv*10)/10)+'×'];
      });
      rows.push(['Blended','CAC '+money(bcac)+' · LTV:CAC '+(Math.round(bltv*10)/10)+'×']);
      var b=withC[0], w=withC[withC.length-1];
      return {hlabel:'Blended CAC payback', headline:months(bpay), rows:rows,
        insight:withC.length>1?b.n+' pays back fastest at '+months(b.pay)+'; '+w.n+' takes '+months(w.pay)+'. Before moving budget, check what the next dollar buys in each program, not just the average.':'Add a second program to compare payback across programs.'};
    }
  },
  { key:'marginal', name:'Next-dollar check', anchor:'325b640a', where:'after',
    eyebrow:'Next-dollar check', h2:'Is the next dollar still worth it?',
    lede:'Compare last month with this month for each program. The average can look fine while the extra spend buys almost nothing. This applies rule three.',
    tag:'Calculator', title:'Spend and qualified opportunities by month', button:'Check my programs',
    form:function(id){
      return rowTable(id,[{name:'Paid',v:[40,16,55,19]},{name:'Outbound',v:[30,12,30,13]},{name:'Partners',v:[10,5,14,7]},{name:'Content',v:[15,6,15,6]}],
          ['Program',{label:'Last month spend ($K)',k:'a'},{label:'Last month opps',k:'b'},{label:'This month spend ($K)',k:'c'},{label:'This month opps',k:'d'}])
        +'<div class="gt-grid">'+field(id+'-t','Target cost per qualified opportunity ($K)',3)+'</div>';
    },
    compute:function(card){
      var T=val(card,'t')*1000; need(T>0,'Enter your target cost per qualified opportunity.');
      var names=['Paid','Outbound','Partners','Content'], res=[];
      names.forEach(function(n,i){
        var a=val(card,'a'+i)*1000, b=val(card,'b'+i), c=val(card,'c'+i)*1000, d=val(card,'d'+i);
        if(isNaN(a)||isNaN(c)||!(c>0)) return;
        need(b>=0&&d>=0,'Enter opportunities for '+n+'.');
        var avg=d>0?c/d:Infinity, ds=c-a, dop=d-b, mc, v;
        if(ds<=0){ mc=null; v=avg<=T?['Room to scale','gt-ok']:['Hold','gt-hold']; }
        else if(dop<=0){ mc=Infinity; v=['Pull back','gt-bad']; }
        else { mc=ds/dop; v=mc>T?['Pull back','gt-bad']:(avg<=T?['Room to scale','gt-ok']:['Hold','gt-hold']); }
        res.push({n:n,avg:avg,mc:mc,v:v});
      });
      need(res.length,'Enter this month’s spend for at least one program.');
      var table='<table class="gt-rank"><thead><tr><th>Program</th><th>Average cost per opp</th><th>Next-dollar cost per opp</th><th></th></tr></thead><tbody>'
        +res.map(function(r){ return '<tr><td>'+r.n+'</td><td>'+(isFinite(r.avg)?money(r.avg):'No opps')+'</td><td>'+(r.mc===null?'Spend flat':(isFinite(r.mc)?money(r.mc):'Bought nothing'))+'</td><td><span class="gt-pill '+r.v[1]+'">'+r.v[0]+'</span></td></tr>'; }).join('')+'</tbody></table>';
      var bad=res.filter(function(r){ return r.v[0]==='Pull back'; }), good=res.filter(function(r){ return r.v[0]==='Room to scale'; });
      var rows=names.map(function(n){ var r=res.filter(function(x){ return x.n===n; })[0]; return [n, r?(r.v[0]+' · average '+(isFinite(r.avg)?money(r.avg):'n/a')+' · next dollar '+(r.mc===null?'spend flat':(isFinite(r.mc)?money(r.mc):'bought nothing'))):'Not entered']; });
      rows.push(['Target cost per qualified opportunity',money(T)]);
      return {hlabel:'Programs where the next dollar costs more than target', headline:bad.length?list(bad.map(function(r){ return r.n; })):'None', small:true, rows:rows, extra:table,
        insight:bad.length?'Pull back on '+list(bad.map(function(r){ return r.n; }))+': the extra spend is buying opportunities above your target, even if the average still looks fine.'+(good.length?' '+list(good.map(function(r){ return r.n; }))+' can take more, in steps of 20 to 30 percent.':''):(good.length?list(good.map(function(r){ return r.n; }))+' can take more budget, in steps of 20 to 30 percent. Hold the rest until cost per opportunity has held for four weeks.':'Nothing needs pulling back. Hold budgets until cost per opportunity has held for four straight weeks.')};
    }
  },
  { key:'capacity', name:'Sales capacity planner', anchor:'27837bf6', where:'after',
    eyebrow:'Sales capacity planner', h2:'How many reps does your number need?',
    lede:'Founder-led sales usually ends with a hiring plan. Enter next year’s new revenue target and how your reps perform, and see how many to hire, and what waiting costs.',
    tag:'Calculator', title:'Your target and your team', button:'Plan my hiring',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-t','New ARR target, next 12 months ($K)',6000)+field(id+'-q','Annual quota per ramped rep ($K)',800)+field(id+'-a','Average attainment (%)',70,{max:200})+field(id+'-r','Months to ramp a new rep',5,{max:24})+field(id+'-n','Ramped reps today',6)+'</div>';
    },
    compute:function(card){
      var T=val(card,'t')*1000, Q=val(card,'q')*1000, at=val(card,'a')/100, R=val(card,'r'), n=val(card,'n');
      need(T>0&&Q>0,'Enter your target and quota.');
      need(at>0,'Enter average attainment.');
      need(R>=0&&R<12,'Ramp time must be under 12 months for this plan.');
      need(n>=0,'Enter how many ramped reps you have.');
      var per=Q*at, cur=n*per, gap=Math.max(0,T-cur);
      var nowC=per*(12-R/2)/12, lateC=per*Math.max(0,12-3-R/2)/12;
      var now=gap>0?Math.ceil(gap/nowC):0, late=gap>0?(lateC>0?Math.ceil(gap/lateC):Infinity):0;
      return {hlabel:'Reps to hire this month', headline:now===1?'1 rep':now+' reps',
        rows:[['What your current team should close',money(cur)],['Gap to target',money(gap)],['A new hire’s first-year contribution',money(nowC)],['Reps to hire if you wait 3 months',isFinite(late)?num(late):'Can’t close the gap this year'],['Ramped reps the target needs in total',num(Math.ceil(T/per))]],
        insight:gap<=0?'Your current team should cover the target at today’s attainment. The risk is attainment, not headcount: protect pipeline per rep.'
          :'Hire '+now+' now to close the '+money(gap)+' gap. Wait three months and you’d need '+(isFinite(late)?late:'more than this year allows')+', because ramp eats into the year. This assumes reps ramp evenly and attainment holds; pipeline per rep usually decides whether it does.'};
    }
  },
  { key:'onboarding', name:'Fintech onboarding calculator', anchor:'5fd2f7a8', where:'append',
    eyebrow:'Onboarding calculator', h2:'What is a better onboarding funnel worth?',
    lede:'Follow a month of visitors from sign-up to funded account. See your real cost per funded customer, and what a 5-point lift at identity check or first funding would add.',
    tag:'Calculator', title:'Your onboarding funnel in a typical month', button:'Calculate my funnel',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-s','Marketing spend a month ($K)',150)+field(id+'-v','Visitors or installs a month',60000)+field(id+'-u','Start sign-up (%)',8,{max:100})+field(id+'-k','Pass identity check (%)',70,{max:100})+field(id+'-f','Fund their account (%)',45,{max:100})+field(id+'-r','Annual revenue per funded customer ($)',180)+'</div>';
    },
    compute:function(card){
      var S=val(card,'s')*1000, V=val(card,'v'), u=val(card,'u')/100, k=val(card,'k')/100, f=val(card,'f')/100, r=val(card,'r');
      need(V>0&&S>=0,'Enter your monthly spend and visitors.');
      [u,k,f].forEach(function(x){ need(x>0&&x<=1,'Enter each conversion rate between 0 and 100.'); });
      need(r>0,'Enter annual revenue per funded customer.');
      var su=V*u, kyc=su*k, fd=kyc*f;
      var k5=Math.min(1,k+.05), f5=Math.min(1,f+.05);
      var exK=su*k5*f-fd, exF=kyc*f5-fd;
      var bigger=exK>=exF?'identity check':'first funding', big=Math.max(exK,exF);
      return {hlabel:'Cost per funded customer', headline:fd>0?money(S/fd):'n/a',
        rows:[['Funded customers a month',num(fd)],['Visitor to funded',pct(fd/V*100,2)],['+5 points at identity check',(exK>0?'+'+num(exK)+' funded a month · +'+money(exK*12*r)+' a year':'Already at 100%')],['+5 points at first funding',(exF>0?'+'+num(exF)+' funded a month · +'+money(exF*12*r)+' a year':'Already at 100%')],['Sign-ups lost before funding each month',num(su-fd)]],
        insight:'A 5-point lift at '+bigger+' is worth more here: about '+num(big)+' more funded customers a month, or '+money(big*12*r)+' in annual revenue, with no extra marketing spend.'};
    }
  },
  { key:'api', name:'Sandbox to live calculator', anchor:'cbf5f22', where:'append',
    eyebrow:'Sandbox to live', h2:'How much revenue is stuck in the sandbox?',
    lede:'For API and infrastructure companies, slow integrations delay revenue you have already won. See what going live faster, or converting more sandboxes, is worth.',
    tag:'Calculator', title:'Your developer funnel', button:'Calculate the value',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-s','New sandbox accounts a month',120)+field(id+'-g','Sandboxes that go live (%)',15,{max:100})+field(id+'-m','Months from sandbox to live',5,{max:36})+field(id+'-r','Monthly revenue per live customer ($)',2500)+field(id+'-x','Months faster to go live',1,{max:36})+'</div>';
    },
    compute:function(card){
      var s=val(card,'s'), g=val(card,'g')/100, m=val(card,'m'), r=val(card,'r'), x=val(card,'x');
      need(s>0&&r>0,'Enter sandbox accounts and revenue per live customer.');
      need(g>0&&g<=1,'Enter the share that go live, between 0 and 100.');
      need(m>=0&&x>=0&&x<=m,'Months faster can’t be more than the months it takes today.');
      var live=s*g*12, arr=live*r*12, fwd=live*r*x, g5=Math.min(1,g+.05), extra=s*(g5-g)*12*r*12;
      return {hlabel:'New annual run-rate from a year of sandboxes', headline:money(arr),
        rows:[['Customers going live a year',num(live)],['Revenue waiting in integration at any time',money(s*g*m*r)+' a month'],['Going live '+x+' month'+(x===1?'':'s')+' faster',(x>0?'+'+money(fwd)+' revenue in the first year':'No change')],['+5 points of sandboxes going live','+'+money(extra)+' annual run-rate'],['Sandbox to live',pct(g*100,1)]],
        insight:'Each month shaved off integration pulls about '+money(live*r)+' of revenue into the year. Faster go-live usually comes from better docs, a guided first integration and someone owning the account during the sandbox stage.'};
    }
  }];

  // ---------- choice and text helpers for the newer tools ----------
  function choice(id,qi,label,opts,note){
    var h='<fieldset class="gt-q"><legend>'+(note?'<small>'+esc(note)+'</small>':'')+esc(label)+'</legend><div class="gt-opts">';
    opts.forEach(function(o,v){ h+='<label><input type="radio" name="'+id+'-c'+qi+'" value="'+v+'" data-q="'+esc(label)+'" data-l="'+esc(o)+'"><span>'+esc(o)+'</span></label>'; });
    return h+'</div></fieldset>';
  }
  function picked(card,qi,label){
    var c=card.querySelector('input[name$="-c'+qi+'"]:checked');
    need(c,'Please answer: '+label);
    return parseInt(c.value,10);
  }
  function tfield(key,label,ph,value){
    return '<div class="gt-field"><label for="'+key+'">'+esc(label)+'</label><input type="text" id="'+key+'" data-k="'+key.split('-').pop()+'" placeholder="'+esc(ph||'')+'" value="'+esc(value||'')+'"></div>';
  }
  function rel(v,med,lowerBetter){ return lowerBetter?(med-v)/med:(v-med)/med; }
  function status(g){ return g>0.1?'Ahead of median':(g<-0.1?'Behind median':'Around median'); }

  var NODEC=[
    ['How many people are involved in the decision?',['1 to 3','4 to 6','7 to 10','11 or more'],[0,1,2,3],'Large buying group','Map every stakeholder and agree a mutual plan with a named owner for each step.'],
    ['Is the budget owner involved yet?',['From the start','Joined later','Not yet'],[0,1,3],'No budget owner yet','Ask your champion to bring the budget owner into the next meeting.'],
    ['Is there a date forcing a decision?',['A hard date','A soft target','None'],[0,1,3],'No forcing date','Tie the decision to a business event they care about, such as a launch, renewal or budget cycle.'],
    ['Have they said what doing nothing costs them?',['Clear and quantified','Mentioned, but vague','Not discussed'],[0,2,3],'Cost of inaction unclear','Put a number on what waiting costs them each quarter, in their words.'],
    ['How many options are they still comparing?',['Just you','Two','Three or more','Still exploring'],[0,1,2,3],'Too many options','Make a clear recommendation and narrow the choice instead of adding more.'],
    ['Since the main demo, have they asked for more demos, references or information?',['No','Once or twice','Repeatedly'],[0,1,3],'Repeated requests for more information','Treat it as fear of getting it wrong: give a firm recommendation and reduce the risk instead of sending more material.'],
    ['Is there a trial or pilot?',['Yes, with agreed success criteria','Yes, without criteria','No trial'],[0,2,1],'Pilot without success criteria','Agree in writing what success looks like before the pilot starts.'],
    ['Do you have a champion who has bought something like this before?',['Yes','Keen, but untested','No clear champion'],[0,1,3],'No proven champion','Find the person who has led a purchase like this before, and give them what they need to sell it internally.']
  ];
  var PM_NAMES=['Per-seat','Hybrid: platform fee plus usage or credits','Usage-based','Outcome-based'];
  var PM_Q=[
    ['As customers get more value, what grows?',[['The number of people using it',[3,1,0,0]],['The volume of work, data or transactions',[0,2,3,0]],['A measurable business result',[0,1,0,3]],['Not much; value is fairly fixed',[2,1,0,0]]]],
    ['How much does usage vary between customers of a similar size?',[['Very little',[2,1,0,0]],['Somewhat',[1,2,1,0]],['A lot',[0,2,3,1]]]],
    ['Does AI in your product do work a person used to do?',[['No',[2,1,0,0]],['Some of it',[0,3,1,1]],['Most of it',[0,1,2,3]]]],
    ['What does AI cost you to run for each customer?',[['Close to nothing',[2,1,0,0]],['A noticeable amount',[0,3,1,0]],['A lot, and it varies',[0,2,3,1]]]],
    ['Can you measure the outcome you deliver, and show it came from you?',[['Yes, clearly',[0,0,0,3]],['Partly',[0,1,1,1]],['No',[1,1,1,0]]]],
    ['How do your buyers prefer to pay?',[['A fixed, predictable budget',[3,2,0,0]],['For what they use',[0,1,3,1]],['A mix of both',[1,3,1,0]]]],
    ['What can your billing system do today?',[['Simple subscriptions only',[2,1,0,0]],['Meter usage',[0,2,2,1]],['Meter usage and run credits',[0,3,2,1]]]]
  ];
  var PM_WHY=['Value grows with the number of people using it, buyers want predictable budgets and AI costs are low.',
    'Buyers get a predictable base, and a usage or credit component captures heavy use and covers AI costs.',
    'Value and cost both scale with volume, and buyers are happy to pay for what they use.',
    'You can count the result you deliver and show it came from you, so price can follow the value.'];
  var PM_WATCH=['If AI starts doing the work of users, seat counts shrink. Add a usage or credit component before that happens.',
    'Keep it explainable: one platform fee and one usage or credit unit. Hybrid buyers often struggle to understand their bill.',
    'Revenue gets harder to forecast. Commit-and-draw-down contracts and usage alerts keep buyers and finance comfortable.',
    'Expect attribution disputes and lumpy revenue. Start with one outcome that is easy to count, and keep a platform fee underneath.'];
  var PM_STEP=['Test whether customers would accept a small usage or credit add-on for AI features, before seat counts come under pressure.',
    'Pick one value metric for the variable part and model last year’s customers on it before announcing anything.',
    'Model last year’s invoices under the new metric, then offer annual commits with draw-down to protect forecasting.',
    'Run a pilot with a few customers on one countable outcome, with a platform fee as a floor.'];

  var MORE=[
  { key:'efficiency', name:'SaaS efficiency benchmark', anchor:'6420b47e', where:'after',
    eyebrow:'Efficiency benchmark', h2:'How do your numbers compare with the median?',
    lede:'Enter six numbers most boards already track. We compare each one with the latest published medians and name the one holding you back.',
    tag:'Benchmark', title:'Your last 12 months', button:'Compare my numbers',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-g','ARR growth (%)',30)+field(id+'-p','CAC payback (months)',18)+field(id+'-n','Net revenue retention (%)',104)+field(id+'-r','Gross revenue retention (%)',88)+field(id+'-c','New CAC ratio ($ spent per $1 of new ARR)',1.8)+field(id+'-m','Gross margin (%)',75,{max:100})+'</div>'
        +'<p class="gt-fine">Medians: growth 22% (SaaS Capital, 2026), CAC payback 16 to 20 months, NRR 101%, GRR 88%, new CAC ratio $2.00 and gross margin 77% (Benchmarkit, 2025). <a href="/benchmarks/">See all benchmarks</a>.</p>';
    },
    compute:function(card){
      var g=val(card,'g'), p=val(card,'p'), n=val(card,'n'), r=val(card,'r'), c=val(card,'c'), m=val(card,'m');
      need(!isNaN(g)&&p>0&&n>0&&r>0&&r<=100&&c>0&&m>0&&m<=100,'Please fill in all six numbers.');
      var M=[['Growth',rel(g,22),pct(g,1)+' (median 22%)','Growth is below the median. Before adding spend, find out whether the constraint is pipeline volume, conversion or retention.'],
        ['CAC payback',rel(p,18,true),months(p)+' (median 16 to 20)','CAC payback is longer than most. Move budget toward programs with the fastest payback, and fix the conversion step losing the most revenue before scaling spend.'],
        ['Retention',Math.min(rel(n,101),rel(r,88)),'NRR '+pct(n,1)+' · GRR '+pct(r,1)+' (medians 101% · 88%)','Retention is your weakest number. SaaS Capital finds the companies with the highest retention grow far faster than the median; an expansion motion and a value metric that grows with use usually move it most.'],
        ['New CAC ratio',rel(c,2,true),'$'+(Math.round(c*100)/100)+' per $1 (median $2.00)','You spend more than most to win new revenue. Put spend into the segments with the best win rates and payback, and judge programs on qualified opportunities, not leads.'],
        ['Gross margin',rel(m,77),pct(m,1)+' (median 77%)','Gross margin is below the software median. If AI features are part of the cost, check what they cost to serve.']];
      var w=M.slice().sort(function(a,b){ return a[1]-b[1]; })[0];
      var rows=M.map(function(x){ return [x[0]+': '+status(x[1]).toLowerCase(), x[2]]; });
      if(w[1]>=-0.1) return {hlabel:'Against the published medians', headline:'No metric behind the median', small:true, rows:rows,
        insight:'Every number is at or ahead of the median. The next question is which one you can push into the top quartile, since that is usually where valuations are decided.'};
      return {hlabel:'Your weakest metric against the median', headline:w[0], small:true, rows:rows, insight:w[3]};
    }
  },
  { key:'shortlist', name:'AI shortlist snapshot', anchor:'3676712', where:'after', request:true,
    eyebrow:'Free AI shortlist snapshot', h2:'Do you show up when buyers ask AI?',
    lede:'Half of software buyers now start their research in an AI chatbot. We’ll ask ChatGPT, Perplexity and Gemini the questions your buyers ask, and show you who gets named, and what they say about you.',
    tag:'Free snapshot', title:'Tell us what to check', button:'Request my snapshot',
    form:function(id){
      return '<div class="gt-grid">'+tfield(id+'-w','Your website','yourcompany.com')+tfield(id+'-k','What buyers search for','e.g. expense management software')+tfield(id+'-x','Up to three competitors','Competitor A, Competitor B')+tfield(id+'-m','Main market','e.g. North America, mid-market')+'</div>';
    },
    compute:function(card){
      var w=textval(card,'w'), k=textval(card,'k'), x=textval(card,'x'), m=textval(card,'m');
      need(w&&k,'Please add your website and what buyers search for.');
      return {hlabel:'Your AI shortlist snapshot', headline:'Request received', small:true,
        rows:[['Company',w],['Category',k],['Competitors',x||'We’ll suggest them'],['Market',m||'Not given'],['What you’ll get','How often you’re named against competitors, and what each AI says about you']],
        insight:'We’ll ask the questions your buyers ask across ChatGPT, Perplexity and Gemini. We’ll be in touch by email to confirm the questions before we run them.',
        esubj:'We have your AI shortlist snapshot request', etitle:'Thanks, {name}. We have your request.', eintro:'Here’s what you asked us to check. Nothing else is needed from you for now.'};
    }
  },
  { key:'nodecision', name:'No-decision risk scorecard', anchor:'665069dd', where:'after',
    eyebrow:'No-decision risk scorecard', h2:'Is your biggest deal about to stall?',
    lede:'Between 40% and 60% of qualified deals end with the buyer deciding nothing. Answer eight questions about one live deal and see its risk of stalling, and what to do next.',
    tag:'Scorecard', title:'One live deal', button:'Score this deal',
    form:function(id){ return '<div class="gt-qs">'+NODEC.map(function(q,i){ return choice(id,i,q[0],q[1]); }).join('')+'</div>'; },
    compute:function(card){
      var pts=0, drv=[];
      NODEC.forEach(function(q,i){ var v=picked(card,i,q[0]), p=q[2][v]; pts+=p; if(p>0) drv.push({p:p,i:i,t:q[3],a:q[4]}); });
      var max=NODEC.reduce(function(s,q){ return s+Math.max.apply(null,q[2]); },0), score=Math.round(pts/max*100);
      var lvl=score<30?'Low':(score<55?'Moderate':'High');
      drv.sort(function(a,b){ return b.p-a.p||a.i-b.i; });
      var rows=[['Risk score',score+' / 100']];
      for(var k=0;k<3;k++) rows.push(drv[k]?[drv[k].t,drv[k].a]:['','']);
      rows.push(['Next step',drv[0]?drv[0].a:'Keep the plan and dates you have agreed.']);
      return {hlabel:'Risk of ending in no decision', headline:lvl+' risk', small:true, rows:rows,
        insight:lvl==='Low'?'This deal has the signals of one that closes: a decision maker, a date and a clear cost of waiting. Protect them, and don’t reopen the comparison.'
          :'Indecision, not competitors, is the main reason deals stall. The research behind The JOLT Effect points to four moves: judge how indecisive the buyer is, offer a clear recommendation, limit exploration, and take risk off the table with pilots, opt-outs or guarantees.'};
    }
  },
  { key:'pricemodel', name:'Pricing model selector', anchor:'53a666a7', where:'after',
    eyebrow:'Pricing model selector', h2:'Seats, usage, hybrid or outcomes?',
    lede:'Seven questions about how your customers get value and what AI costs you to run. We recommend a pricing model, explain why, and show what to watch out for.',
    tag:'Selector', title:'How your product creates value', button:'Recommend a model',
    form:function(id){ return '<div class="gt-qs">'+PM_Q.map(function(q,i){ return choice(id,i,q[0],q[1].map(function(o){ return o[0]; })); }).join('')+'</div>'; },
    compute:function(card){
      var s=[0,0,0,0], mx=[0,0,0,0];
      PM_Q.forEach(function(q,i){ var v=picked(card,i,q[0]); q[1][v][1].forEach(function(x,j){ s[j]+=x; }); });
      PM_Q.forEach(function(q){ for(var j=0;j<4;j++) mx[j]+=Math.max.apply(null,q[1].map(function(o){ return o[1][j]; })); });
      var fit=s.map(function(x,j){ return Math.round(x/mx[j]*100); });
      var order=[0,1,2,3].sort(function(a,b){ return fit[b]-fit[a]||b-a; }), b=order[0], r=order[1];
      return {hlabel:'Best fit for how you create value', headline:PM_NAMES[b], small:true,
        rows:[['Best fit',PM_NAMES[b]+' ('+fit[b]+'% fit)'],['Runner-up',PM_NAMES[r]+' ('+fit[r]+'% fit)'],['Why',PM_WHY[b]],['Watch out for',PM_WATCH[b]],['First step',PM_STEP[b]]],
        insight:'Hybrid pricing is now the most common primary model in B2B software (37%, up from 25% a year earlier), and 29% of companies already price AI with credits or tokens (Growth Unhinged, 2026). The right answer depends on how your customers get value, which is what these questions test.'};
    }
  },
  { key:'aimargin', name:'AI feature margin calculator', anchor:'53a666a7', where:'after',
    eyebrow:'AI margin calculator', h2:'What do AI features do to your gross margin?',
    lede:'AI features cost money every time they run. Enter what a typical customer pays and uses, and see your margin with AI included, the price that protects it, and how much AI you can include.',
    tag:'Calculator', title:'One typical customer, per month', button:'Check my margin',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-p','Price per customer a month ($)',2000)+field(id+'-g','Gross margin before AI (%)',80,{max:100})+field(id+'-u','Users who use AI features',25)+field(id+'-t','AI tasks per user a month',200)+field(id+'-c','Cost to run one AI task ($)',0.02)+field(id+'-x','Target gross margin (%)',75,{max:99})+'</div>';
    },
    compute:function(card){
      var P=val(card,'p'), g=val(card,'g')/100, u=val(card,'u'), t=val(card,'t'), c=val(card,'c'), T=val(card,'x')/100;
      need(P>0&&g>0&&g<=1&&u>=0&&t>=0&&c>=0&&T>0&&T<1,'Please fill in every number; margins must be between 0 and 100.');
      var base=P*(1-g), ai=u*t*c, gm=(P-base-ai)/P, price=(base+ai)/(1-T), room=P*(1-T)-base, tasks=c>0?Math.max(0,room/c):Infinity;
      var perTask=u*t>0?Math.max(0,room/(u*t)):Infinity;
      return {hlabel:'Gross margin with AI included', headline:pct(gm*100,1),
        rows:[['AI cost per customer a month','$'+num(ai)+' ('+pct(ai/P*100,1)+' of the price)'],['Margin change',(gm-g>=0?'+':'')+(Math.round((gm-g)*1000)/10)+' points'],['Price that holds a '+pct(T*100)+' margin','$'+num(price)+' a month'],['AI tasks you can include at today’s price',room>0?(isFinite(tasks)?num(tasks)+' a month':'Unlimited'):'None without missing the target'],['Cost per task needed at today’s usage',room>0?(isFinite(perTask)?'$'+(Math.round(perTask*10000)/10000):'Any'):'Not reachable']],
        insight:gm>=T?'AI fits inside your target margin today. Set a fair-use allowance or credits now, so heavy users don’t erode it as adoption grows.'
          :'AI pushes you below your target margin. The usual fixes are a credit allowance with paid top-ups, a higher tier for AI-heavy use, or cheaper models for routine tasks. Growth Unhinged’s 2026 survey puts the median AI gross margin target at about 50%, well below software’s 70 to 80%.'};
    }
  },
  { key:'forecast', name:'Forecast accuracy checker', anchor:'be24d5e', where:'after',
    eyebrow:'Forecast accuracy checker', h2:'Can your board trust the forecast?',
    lede:'Enter your forecast at the start of each of the last four quarters, and what you actually booked. We show how accurate you were, and whether you lean high or low.',
    tag:'Calculator', title:'Forecast against actual, last four quarters', button:'Check my forecast',
    form:function(id){
      return rowTable(id,[{name:'Four quarters ago',v:[1200,1050]},{name:'Three quarters ago',v:[1300,1240]},{name:'Two quarters ago',v:[1400,1180]},{name:'Last quarter',v:[1350,1290]}],
        ['Quarter',{label:'Forecast ($K)',k:'f'},{label:'Actual bookings ($K)',k:'a'}]);
    },
    compute:function(card){
      var names=['Four quarters ago','Three quarters ago','Two quarters ago','Last quarter'], q=[];
      names.forEach(function(n,i){ var f=val(card,'f'+i), a=val(card,'a'+i); if(isNaN(f)&&isNaN(a)) return; need(f>0&&a>0,'Enter both numbers for '+n.toLowerCase()+'.'); q.push({n:n,f:f,a:a,e:(f-a)/a}); });
      need(q.length>=2,'Enter at least two quarters.');
      var acc=q.reduce(function(s,x){ return s+Math.max(0,1-Math.abs(x.e)); },0)/q.length*100, bias=q.reduce(function(s,x){ return s+x.e; },0)/q.length*100;
      var rows=q.map(function(x){ return [x.n,'Forecast $'+num(x.f)+'K \u00b7 actual $'+num(x.a)+'K ('+(x.e>=0?'+':'')+(Math.round(x.e*1000)/10)+'%)']; });
      while(rows.length<4) rows.push(['','']);
      rows.push(['Bias',Math.abs(bias)<3?'Balanced':(bias>0?'Forecasts '+pct(bias,1)+' high on average':'Forecasts '+pct(-bias,1)+' low on average')]);
      return {hlabel:'Average forecast accuracy', headline:pct(acc,1), rows:rows,
        insight:bias>5?'You forecast high almost every quarter. That usually means deals are counted before the buyer has committed: tighten the exit criteria for your late stages, and track how often deals slip.'
          :(bias<-5?'You forecast low, which hides real capacity and leads to under-investment. Check whether reps hold deals back until they are certain.'
          :(acc>=90?'Your forecast is accurate and balanced. Keep stage definitions written down, and inspect any quarter that misses by more than 10%.':'Misses go both ways, which points to inconsistent stage definitions. Write down what each stage means and what has to be true to move a deal forward.'))};
    }
  },
  { key:'nrr', name:'Net revenue retention calculator', anchor:'43592b1b', where:'after',
    eyebrow:'Retention calculator', h2:'What is a few points of retention worth?',
    lede:'Net revenue retention compounds. See where your ARR lands in a few years at today’s retention and at your target, and how much extra new business it would take to make up the gap.',
    tag:'Calculator', title:'Your revenue today', button:'Show the difference',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-a','ARR today ($M)',10)+field(id+'-n','Net revenue retention today (%)',100)+field(id+'-t','Target net revenue retention (%)',110)+field(id+'-w','New-customer ARR a year ($M)',3)+field(id+'-y','Years ahead',3,{max:10})+'</div>';
    },
    compute:function(card){
      var A=val(card,'a')*1e6, n=val(card,'n')/100, t=val(card,'t')/100, w=val(card,'w')*1e6, y=Math.round(val(card,'y'));
      need(A>0&&n>0&&t>0&&w>=0&&y>=1&&y<=10,'Please fill in every number; years must be between 1 and 10.');
      function run(r){ var a=A; for(var i=0;i<y;i++) a=a*r+w; return a; }
      var now=run(n), tgt=run(t), S=0; for(var k=0;k<y;k++) S+=Math.pow(n,k);
      var need2=(tgt-A*Math.pow(n,y))/S;
      return {hlabel:'Extra ARR in '+y+' years at '+pct(t*100)+' retention', headline:(tgt-now>=0?'+':'')+money(tgt-now),
        rows:[['ARR in '+y+' years at '+pct(n*100),money(now)],['ARR in '+y+' years at '+pct(t*100),money(tgt)],['From existing customers alone at '+pct(t*100),money(A*Math.pow(t,y))],['New-customer ARR a year to match, at today’s retention',money(need2)+' (today '+money(w)+')'],['Extra new business that would take',money(need2-w)+' a year']],
        insight:'Retention compounds on the whole base every year, while new business only adds to it. SaaS Capital’s 2026 research finds the companies with the highest net revenue retention grow far faster than the median. Expansion pricing and a customer pipeline target are usually the cheapest growth available.'};
    }
  },
  { key:'friction', name:'Onboarding friction audit', anchor:'5fd2f7a8', where:'append',
    eyebrow:'Onboarding friction audit', h2:'How much friction is in your sign-up flow?',
    lede:'People give up a financial sign-up after about 19 minutes on average, and the top reasons are that it took too long or asked for too much. Score your flow and see the fixes worth making first.',
    tag:'Audit', title:'Your sign-up flow today', button:'Score my flow',
    form:function(id){
      return '<div class="gt-grid">'+field(id+'-s','Screens from start to funded',12)+field(id+'-f','Form fields the user fills in',25)+field(id+'-m','Typical minutes to finish',14)+field(id+'-d','Documents to upload',1)+'</div>'
        +'<div class="gt-qs">'+choice(id,0,'How long does the identity check take?',['Instant','Minutes','Hours','Days'])+choice(id,1,'Can people save and come back later?',['Yes','No'])+choice(id,2,'Do you prefill what you already know or can look up?',['Yes','Partly','No'])+choice(id,3,'How do people first fund their account?',['Instant bank link','Card','Manual transfer only'])+'</div>';
    },
    compute:function(card){
      var s=val(card,'s'), f=val(card,'f'), m=val(card,'m'), d=val(card,'d');
      need(s>0&&f>=0&&m>0&&d>=0,'Please fill in the four numbers.');
      var idc=picked(card,0,'identity check time'), sv=picked(card,1,'save and resume'), pf=picked(card,2,'prefill'), fu=picked(card,3,'funding method');
      var parts=[
        [Math.min(30,m/19*20),'Too long to finish','Cut the time to finish: move anything not needed for approval until after the account is open.'],
        [Math.min(15,Math.max(0,f-10)*0.6),'Too many form fields','Remove or defer every field you don’t need to approve the account.'],
        [Math.min(10,Math.max(0,s-6)),'Too many screens','Combine screens; each extra step is another place to quit.'],
        [Math.min(10,d*4),'Document uploads','Replace uploads with database or open-banking checks where regulation allows.'],
        [[0,3,8,12][idc],'Slow identity check','Use instant verification with manual review only for exceptions, and keep people moving while it runs.'],
        [[0,6][sv],'No save and resume','Let people save and come back by email or text, so a missing document doesn’t mean starting over.'],
        [[0,3,6][pf],'Asking for what you could look up','Prefill from what you already know: device data, address lookup and bank data.'],
        [[0,2,8][fu],'Slow first funding','Offer an instant bank link for the first deposit, so people are funded before they lose interest.']];
      var score=Math.min(100,Math.round(parts.reduce(function(t,p){ return t+p[0]; },0)));
      var top=parts.filter(function(p){ return p[0]>0; }).sort(function(a,b){ return b[0]-a[0]; });
      var gap=19-m, rows=[['Friction score',score+' / 100 (lower is better)'],['Time against the 19-minute average quit point',gap>=0?num(m)+' minutes, '+num(gap)+' minutes inside it':num(m)+' minutes, '+num(-gap)+' minutes past it']];
      for(var k=0;k<3;k++) rows.push(top[k]?[top[k][1],top[k][2]]:['','']);
      return {hlabel:'Onboarding friction score', headline:score+' / 100', rows:rows,
        insight:'Signicat’s research finds 68% of consumers have abandoned a financial sign-up, and the top reasons are that it took too long, asked for too much personal information, or they changed their mind. Fix the biggest source of friction first, then measure each step’s drop-off before and after.'};
    }
  },
  { key:'integration', name:'Integration time-to-value planner', anchor:'cbf5f22', where:'append',
    eyebrow:'Integration planner', h2:'Where do the weeks go between signature and first transaction?',
    lede:'For API and infrastructure companies, revenue starts at the first live transaction, not at signature. Map the stages, find the bottleneck and see what shortening it is worth.',
    tag:'Planner', title:'Weeks spent at each stage', button:'Find my bottleneck',
    form:function(id){
      return rowTable(id,[{name:'Sandbox to first API call',v:[1]},{name:'Security and compliance review',v:[6]},{name:'Contract and legal',v:[4]},{name:'Integration build',v:[8]},{name:'Testing and certification',v:[4]},{name:'Go-live to first live transaction',v:[3]}],['Stage',{label:'Weeks',k:'w'}])
        +'<div class="gt-grid">'+field(id+'-r','Monthly revenue per live customer ($)',2500)+field(id+'-n','New customers signed a month',4)+'</div>';
    },
    compute:function(card){
      var names=['Sandbox to first API call','Security and compliance review','Contract and legal','Integration build','Testing and certification','Go-live to first live transaction'];
      var w=names.map(function(n,i){ var v=val(card,'w'+i); return isNaN(v)?0:Math.max(0,v); }), R=val(card,'r'), N=val(card,'n');
      need(R>0&&N>0,'Enter revenue per live customer and customers signed a month.');
      var T=w.reduce(function(a,b){ return a+b; },0); need(T>0,'Enter the weeks for at least one stage.');
      var bi=w.indexOf(Math.max.apply(null,w)), wk=4.345, per=T/wk*R, yr=per*N*12, half=w[bi]/2/wk*R*N*12;
      return {hlabel:'Weeks from signature to first live transaction', headline:num(T)+' weeks',
        rows:[['Biggest bottleneck',names[bi]+': '+num(w[bi])+' weeks ('+pct(w[bi]/T*100)+' of the total)'],['Revenue waiting per new customer',money(per)],['Revenue delayed each year, across new customers',money(yr)],['Halving the bottleneck is worth',money(half)+' a year, pulled forward'],['Second-longest stage',(function(){ var c=w.slice(); c[bi]=-1; var j=c.indexOf(Math.max.apply(null,c)); return names[j]+': '+num(w[j])+' weeks'; })()]],
        insight:'Most of the time between signature and revenue usually sits in one or two stages, often security review or integration build. Pre-approved security packs, a guided first integration and a named owner during the sandbox stage usually shorten them most.'};
    }
  }];
  MORE.forEach(function(t){ TOOLS.push(t); });

  // pages each tool lives on, for the tools hub and links
  var PAGES={quiz:'/services/go-to-market-diagnostic/',efficiency:'/services/go-to-market-diagnostic/',funnel:'/services/pipeline-programs/',cac:'/services/pipeline-programs/',marginal:'/services/pipeline-programs/',forecast:'/services/pipeline-programs/',
    segments:'/services/segments-icp/',shortlist:'/services/segments-icp/',nodecision:'/services/segments-icp/',discount:'/services/pricing-packaging/',price:'/services/pricing-packaging/',pricemodel:'/services/pricing-packaging/',aimargin:'/services/pricing-packaging/',
    capacity:'/industries/software-saas/',nrr:'/industries/software-saas/',onboarding:'/industries/fintech/',friction:'/industries/fintech/',api:'/industries/fintech/',integration:'/industries/fintech/'};
  var GROUPS=[['Go-to-market diagnostic',['quiz','efficiency']],['Segments and positioning',['shortlist','segments','nodecision']],['Pricing and packaging',['discount','price','pricemodel','aimargin']],['Pipeline programs',['funnel','cac','marginal','forecast']],['Software and SaaS',['capacity','nrr','inhouse']],['Fintech',['onboarding','friction','api','integration']]];
  function hub(){
    var anchor=document.querySelector('[data-id="7001700a"]');
    if(!anchor||document.getElementById('gt-hub')) return;
    var byKey={}; TOOLS.forEach(function(t){ byKey[t.key]=t; });
    byKey.inhouse={name:'In-house team cost calculator',h2:'What would a full growth team cost you in year one?'};
    PAGES.inhouse='/';
    var h='<section class="gt-sec gt-hubsec" id="gt-hub"><div class="gt-hubwrap">';
    GROUPS.forEach(function(g){
      h+='<div class="gt-hubgroup"><p class="gt-eye">'+esc(g[0])+'</p><div class="gt-hubgrid">';
      g[1].forEach(function(k){ var t=byKey[k]; if(!t) return; h+='<a class="gt-hubcard" href="'+PAGES[k]+(k==='inhouse'?'#gth':'#gt-'+k)+'"><span class="gt-tag">'+esc(t.request?'Free snapshot':(t.tag||'Calculator'))+'</span><strong>'+esc(t.name)+'</strong><span>'+esc(t.h2)+'</span><em>Open the tool →</em></a>'; });
      h+='</div></div>';
    });
    h+='</div></section>';
    var wrap=document.createElement('div'); wrap.innerHTML=h; anchor.parentNode.insertBefore(wrap.firstChild,anchor.nextSibling);
  }
  function deeplink(){
    var id=(location.hash||'').slice(1); if(!/^gt-|^gth$/.test(id)) return;
    var el=id==='gth'?document.querySelector('[data-id="38800e20"]'):document.getElementById(id); if(!el) return;
    var panel=el.closest('[role="tabpanel"],.e-tab-content-base');
    if(panel&&panel.id){ var tab=document.querySelector('[aria-controls="'+panel.id+'"]'); if(tab) tab.click(); }
    setTimeout(function(){ el.scrollIntoView({block:'start'}); },150);
  }

  // ---------- rendering ----------
  function sectionHtml(t){
    var id='gt-'+t.key;
    return '<section class="gt-sec" id="'+id+'" aria-labelledby="'+id+'-h"><div class="gt-in">'
      +'<div class="gt-intro"><p class="gt-eye">'+esc(t.eyebrow)+'</p><h2 class="gt-h2" id="'+id+'-h">'+esc(t.h2)+'</h2><p class="gt-lede">'+esc(t.lede)+'</p></div>'
      +'<div class="gt-card"><div class="gt-top"><span class="gt-tag">'+esc(t.tag)+'</span><span class="gt-badge">Free tool</span></div>'
      +'<h3 class="gt-title">'+esc(t.title)+'</h3>'
      +'<form class="gt-form" novalidate>'+t.form(id)+'</form>'
      +'<p class="gt-err" role="alert"></p>'
      +'<button type="button" class="gt-btn gt-go">'+esc(t.button)+' →</button>'
      +'<div class="gt-gate gt-hide"><h4 class="gt-gate-h">'+(t.request?'Where should we send your snapshot?':'Where should we send your results?')+'</h4>'
      +'<div class="gt-grid"><div class="gt-field"><label for="'+id+'-gn">Name *</label><input type="text" id="'+id+'-gn" autocomplete="name"></div>'
      +'<div class="gt-field"><label for="'+id+'-ge">Work email *</label><input type="email" id="'+id+'-ge" autocomplete="email"></div>'
      +'<div class="gt-field"><label for="'+id+'-gc">Company</label><input type="text" id="'+id+'-gc" autocomplete="organization"></div></div>'
      +'<p class="gt-fine">'+(t.request?'We\u2019ll email you to confirm the details, then send your snapshot. See our <a href="/privacy-policy/">privacy policy</a>.':'We\u2019ll show your results here and email you a copy. We may follow up once about them. See our <a href="/privacy-policy/">privacy policy</a>.')+'</p>'
      +'<p class="gt-err gt-gate-err" role="alert"></p>'
      +'<button type="button" class="gt-btn gt-btn-signal gt-unlock">'+(t.request?'Send my request':'Show my results')+' \u2192</button></div>'
      +'<div class="gt-res gt-hide" aria-live="polite" tabindex="-1"></div>'
      +'</div></div></section>';
  }
  function resultHtml(r,note){
    var h='<div class="gt-hl"><span class="gt-tag">'+esc(r.hlabel)+'</span><p class="gt-num'+(r.small?' gt-num-s':'')+'">'+esc(r.headline)+'</p></div>';
    if(r.extra) h+=r.extra;
    h+='<dl class="gt-rows">'+r.rows.filter(function(x){ return x[0]; }).map(function(x){ return '<div><dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd></div>'; }).join('')+'</dl>';
    h+='<p class="gt-insight">'+esc(r.insight)+'</p>';
    if(note) h+='<p class="gt-note'+(note.warn?' gt-warn':'')+'">'+esc(note.text)+'</p>';
    h+='<div class="gt-cta"><a class="gt-btn gt-btn-signal" href="/contact/">Book a diagnostic →</a><button type="button" class="gt-linkbtn gt-resend">Email me these results</button></div>';
    return h;
  }

  function send(t,r,c,card){
    var cfg=window.elementorFrontendConfig||{}, url=cfg.urls&&cfg.urls.ajaxurl, nonce=cfg.nonces&&cfg.nonces.atomicFormsSendForm;
    if(!url||!nonce||!window.fetch||!window.FormData) return Promise.resolve(false);
    var rows=r.rows.slice(0,5); while(rows.length<5) rows.push(['','']);
    var f=[['gname','Name',c.name,'text'],['gemail','Work email',c.email,'email'],['gcompany','Company',c.company||'Not given','text'],['tool','Tool',t.name,'text'],['page','Page',location.host+location.pathname,'text'],
      ['hlabel','Result label',r.hlabel,'text'],['headline','Result',r.headline,'text']];
    rows.forEach(function(x,i){ f.push(['r'+(i+1)+'l','Row '+(i+1)+' label',x[0]||' ','text']); f.push(['r'+(i+1)+'v','Row '+(i+1),x[1]||' ','text']); });
    f.push(['insight','What it means',r.insight,'text']); f.push(['inputs','Inputs',r.inputs||summary(card),'text']);
    var nm=/^[A-Z][a-z]/.test(t.name)?t.name.charAt(0).toLowerCase()+t.name.slice(1):t.name;
    f.push(['esubj','Email subject',r.esubj||('Your '+nm+' results'),'text']); f.push(['etitle','Email title',r.etitle?r.etitle.replace('{name}',c.name):('Here are your results, '+c.name+'.'),'text']); f.push(['eintro','Email intro',r.eintro||'A copy of what you calculated on our website, so you can come back to it or share it with your team.','text']);
    var fd=new FormData();
    fd.append('action','elementor_pro_atomic_forms_send_form'); fd.append('_nonce',nonce);
    fd.append('post_id',FORM.post); fd.append('form_id',FORM.id); fd.append('form_name',FORM.name);
    fd.append('referer_title',document.title); fd.append('referrer',location.href);
    f.forEach(function(x,i){ var p='form_fields['+i+']'; fd.append(p+'[id]',x[0]); fd.append(p+'[type]',x[3]); fd.append(p+'[label]',x[1]); fd.append(p+'[name]',x[0]); fd.append(p+'[options]','null'); fd.append(p+'[value]',x[2]); });
    var timeout=new Promise(function(res){ setTimeout(function(){ res(false); },10000); });
    var req=fetch(url,{method:'POST',body:fd,credentials:'same-origin'}).then(function(x){ return x.ok?x.json():null; }).then(function(j){ return !!(j&&j.success); }).catch(function(){ return false; });
    return Promise.race([req,timeout]);
  }

  function mount(t){
    var anchor=document.querySelector('[data-id="'+t.anchor+'"]');
    if(!anchor || document.getElementById('gt-'+t.key)) return;
    var wrap=document.createElement('div'); wrap.innerHTML=sectionHtml(t);
    var sec=wrap.firstChild;
    if(t.where==='append') anchor.appendChild(sec);
    else { var ref=anchor; while(ref.nextElementSibling&&ref.nextElementSibling.classList&&ref.nextElementSibling.classList.contains('gt-sec')) ref=ref.nextElementSibling; ref.parentNode.insertBefore(sec,ref.nextSibling); }
    var card=sec.querySelector('.gt-card'), err=card.querySelector('.gt-err'), go=card.querySelector('.gt-go'),
        gate=card.querySelector('.gt-gate'), gerr=card.querySelector('.gt-gate-err'), unlock=card.querySelector('.gt-unlock'), res=card.querySelector('.gt-res');
    var unlocked=false, last=null;
    var gn=gate.querySelector('[id$="-gn"]'), ge=gate.querySelector('[id$="-ge"]'), gc=gate.querySelector('[id$="-gc"]');
    var c0=store(); gn.value=c0.name||''; ge.value=c0.email||''; gc.value=c0.company||'';
    sec.querySelector('form').addEventListener('submit',function(e){ e.preventDefault(); go.click(); });
    function calc(){
      err.textContent='';
      try{ last=t.compute(card); }catch(e){ err.textContent=e.message; last=null; }
      return last;
    }
    function show(note){
      res.innerHTML=resultHtml(last,note); res.classList.remove('gt-hide');
      if(t.request){ var rb=res.querySelector('.gt-resend'); if(rb) rb.remove(); }
      res.querySelector('.gt-resend').addEventListener('click',function(){
        var b=this; b.disabled=true; b.textContent='Sending…';
        var r=calc(); if(!r){ b.disabled=false; b.textContent='Email me these results'; return; }
        send(t,r,store(),card).then(function(ok){ b.textContent=ok?'Sent. Check your inbox':'Couldn’t send just now'; });
      });
    }
    go.addEventListener('click',function(){
      if(!calc()) return;
      if(unlocked){ show(); return; }
      gate.classList.remove('gt-hide'); go.classList.add('gt-hide');
      (gn.value?(ge.value?unlock:ge):gn).focus();
    });
    unlock.addEventListener('click',function(){
      gerr.textContent='';
      var c={name:gn.value.trim(),email:ge.value.trim(),company:gc.value.trim()};
      if(!c.name){ gerr.textContent='Please enter your name.'; gn.focus(); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)){ gerr.textContent='Please enter a valid work email.'; ge.focus(); return; }
      if(!calc()){ return; }
      save(c); unlock.disabled=true; unlock.textContent='Sending…';
      send(t,last,c,card).then(function(ok){
        unlocked=true; gate.classList.add('gt-hide'); if(!t.request){ go.classList.remove('gt-hide'); go.textContent='Update my results \u2192'; }
        show(ok?{text:t.request?'We\u2019ve emailed a confirmation to '+c.email+'.':'We\u2019ve emailed a copy to '+c.email+'.'}:{text:t.request?'We couldn\u2019t send your request just now. Please try again in a moment.':'We couldn\u2019t email a copy just now, but here are your results.',warn:true});
        if(t.request&&!ok){ unlocked=false; gate.classList.remove('gt-hide'); unlock.disabled=false; unlock.textContent='Send my request \u2192'; }
        res.focus({preventScroll:true}); res.scrollIntoView({behavior:'smooth',block:'nearest'});
        try{ if(window.dataLayer) window.dataLayer.push({event:'gmp_tool_lead',tool:t.key}); }catch(e){}
      });
    });
  }


  // ---------- home page: build vs. partner card becomes a live calculator ----------
  function inhouse(){
    var total=document.querySelector('[data-id="2f8b5944"]');
    if(!total || total.closest('.gth-on')) return;
    var card=document.querySelector('[data-id="51ad9217"]') && total.closest('[data-id="570931b"]') || total.parentElement.parentElement;
    var roles=[['5d3a80e3','dd1530b',176000],['1af52347','1897d4e5',115750],['fefc3d4','649af03f',111000],['68d7e80c','402a71c9',108000],['5ea75ab5','333d4db',85500]];
    var q=function(id){ return document.querySelector('[data-id="'+id+'"]'); };
    if(roles.some(function(r){ return !q(r[0])||!q(r[1]); })) return;
    var root=total.closest('[data-id="38800e20"]')||document; root.classList.add('gth-on');
    var fmt=function(v){ return '$'+Math.round(v).toLocaleString('en-US'); };
    var box=function(cls,val,label,w){ return '<input type="number" inputmode="decimal" min="0" step="any" class="gth-in '+cls+'" value="'+val+'" aria-label="'+esc(label)+'"'+(w?' style="width:'+w+'"':'')+'>'; };
    roles.forEach(function(r,i){
      var l=q(r[0]), v=q(r[1]), name=l.textContent.trim();
      l.innerHTML='<label class="gth-role"><input type="checkbox" class="gth-chk" checked aria-label="Include '+esc(name)+'"><span>'+esc(name)+'</span></label>';
      v.innerHTML='<span class="gth-cur">$</span>'+box('gth-sal',r[2],name+' salary');
      r.push(l.querySelector('.gth-chk'), v.querySelector('.gth-sal'), name);
    });
    var bl=q('5aefb0dd'), bv=q('11e9dd50'), rl=q('791f4c25'), rv=q('765ae815');
    bl.innerHTML='Benefits and payroll at '+box('gth-ben',42.86,'Benefits and payroll as a percentage of salary','5.2em')+'% of salary';
    rl.innerHTML='Recruiting fees at '+box('gth-rec',20,'Recruiting fee percentage','4em')+'%';
    var head=q('5d681796'), eye=q('6e2c97f1'), teamV=q('2107fe2e'), vpV=q('2a32fcf5'), vpL=q('7221d3e');
    var barT=q('7a3159fa'), barV=q('46ff16'), barG=q('6c178c83');
    if(eye) eye.textContent='Hiring in-house · enter your own numbers';
    var words=['no','one','two','three','four','five'];
    var ben=root.querySelector('.gth-ben'), rec=root.querySelector('.gth-rec');
    var state={};
    function calc(){
      var b=Math.max(0,parseFloat(ben.value)||0)/100, f=Math.max(0,parseFloat(rec.value)||0)/100, sal=0, n=0, inc=[];
      roles.forEach(function(r){ var s=Math.max(0,parseFloat(r[4].value)||0); r[4].disabled=!r[3].checked; if(r[3].checked){ sal+=s; n++; inc.push(r[5]); } q(r[0]).parentElement.classList.toggle('gth-off',!r[3].checked); });
      var vpSal=Math.max(0,parseFloat(roles[0][4].value)||0);
      var tot=sal*(1+b+f), vp=vpSal*(1+b+f);
      total.textContent=fmt(tot); bv.textContent=fmt(sal*b); rv.textContent=fmt(sal*f);
      if(head) head.textContent='What a '+words[n]+'-person growth team costs in year one';
      if(teamV) teamV.textContent=fmt(tot);
      if(vpV) vpV.textContent=fmt(vp);
      if(vpL) vpL.textContent='One '+roles[0][5]+' hire';
      var max=Math.max(tot,vp,1);
      if(barT) barT.style.width=(tot/max*100)+'%';
      if(barV) barV.style.width=(vp/max*100)+'%';
      if(barG) barG.style.width=(tot*.25/max*100)+'%';
      state={tot:tot,sal:sal,b:b,f:f,vp:vp,n:n,inc:inc};
    }
    root.addEventListener('input',function(e){ if(e.target.closest('.gth-in,.gth-chk')) calc(); });
    root.addEventListener('change',function(e){ if(e.target.closest('.gth-chk')) calc(); });
    calc();
    // optional emailed breakdown, through the same gate as the other tools
    var note=q('5d4bb9f7'), host=note?note.parentElement:total.parentElement.parentElement;
    var g=document.createElement('div'); g.className='gth-gate';
    g.innerHTML='<button type="button" class="gt-linkbtn gth-open">Email me this breakdown</button>'
      +'<div class="gt-gate gt-hide"><div class="gt-grid"><div class="gt-field"><label for="gth-gn">Name *</label><input type="text" id="gth-gn" autocomplete="name"></div><div class="gt-field"><label for="gth-ge">Work email *</label><input type="email" id="gth-ge" autocomplete="email"></div><div class="gt-field"><label for="gth-gc">Company</label><input type="text" id="gth-gc" autocomplete="organization"></div></div>'
      +'<p class="gt-fine">We’ll email you this breakdown and may follow up once about it. See our <a href="/privacy-policy/">privacy policy</a>.</p><p class="gt-err" role="alert"></p><button type="button" class="gt-btn gt-btn-signal gth-send">Email my breakdown →</button></div><p class="gt-note gt-hide" aria-live="polite"></p>';
    host.appendChild(g);
    var gate=g.querySelector('.gt-gate'), err=g.querySelector('.gt-err'), msg=g.querySelector('.gt-note'), btn=g.querySelector('.gth-send');
    var gn=g.querySelector('#gth-gn'), ge=g.querySelector('#gth-ge'), gc=g.querySelector('#gth-gc'), c0=store();
    gn.value=c0.name||''; ge.value=c0.email||''; gc.value=c0.company||'';
    g.querySelector('.gth-open').addEventListener('click',function(){ gate.classList.remove('gt-hide'); this.classList.add('gt-hide'); (gn.value?ge:gn).focus(); });
    btn.addEventListener('click',function(){
      err.textContent='';
      var c={name:gn.value.trim(),email:ge.value.trim(),company:gc.value.trim()};
      if(!c.name){ err.textContent='Please enter your name.'; gn.focus(); return; }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email)){ err.textContent='Please enter a valid work email.'; ge.focus(); return; }
      calc(); save(c); btn.disabled=true; btn.textContent='Sending…';
      var s=state, r={hlabel:'First-year cost of your in-house growth team', headline:fmt(s.tot),
        rows:[['Roles included',s.inc.length?s.inc.join(', '):'None'],['Salaries',fmt(s.sal)],['Benefits and payroll at '+Math.round(s.b*1000)/10+'%',fmt(s.sal*s.b)],['Recruiting fees at '+Math.round(s.f*1000)/10+'%',fmt(s.sal*s.f)],['One '+roles[0][5]+' hire, all in',fmt(s.vp)]],
        insight:'That is before bonuses, equity, software and the months it takes to hire and ramp a new team. Growth Marketing Partners typically comes in about 75% below the in-house team, depending on scope.',
        inputs:roles.map(function(x){ return x[5]+': '+(x[3].checked?fmt(parseFloat(x[4].value)||0):'not included'); }).join(' · ')+' · Benefits and payroll: '+ben.value+'% · Recruiting fee: '+rec.value+'%'};
      send({name:'In-house team cost calculator'},r,c,g).then(function(ok){
        gate.classList.add('gt-hide'); msg.classList.remove('gt-hide');
        msg.classList.toggle('gt-warn',!ok);
        msg.textContent=ok?'Sent. We’ve emailed this breakdown to '+c.email+'.':'We couldn’t send it just now. Please try again in a moment.';
        if(!ok){ btn.disabled=false; btn.textContent='Email my breakdown →'; gate.classList.remove('gt-hide'); }
        try{ if(ok&&window.dataLayer) window.dataLayer.push({event:'gmp_tool_lead',tool:'inhouse'}); }catch(e){}
      });
    });
  }
  function init(){ TOOLS.forEach(function(t){ try{ mount(t); }catch(e){ if(window.console) console.warn('GMP tool '+t.key,e); } }); try{ inhouse(); }catch(e){ if(window.console) console.warn('GMP in-house calculator',e); } try{ hub(); deeplink(); }catch(e){} }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
