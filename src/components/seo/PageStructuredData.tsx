export function PageStructuredData({title,canonical,faq=[]}:{title:string;canonical:string;faq?:{question:string;answer:string}[]}) {
  const plain=(text:string)=>text.replace(/\[([^\]]+)\]\([^)]*\)/g,"$1");
  const data = {"@context":"https://schema.org","@type":faq.length?"FAQPage":"WebPage",name:plain(title),url:`https://vasilismoumkas.com${canonical}`,
    ...(faq.length?{mainEntity:faq.map(item=>({"@type":"Question",name:plain(item.question),acceptedAnswer:{"@type":"Answer",text:plain(item.answer)}}))}:{})};
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,"\\u003c")}}/>;
}
