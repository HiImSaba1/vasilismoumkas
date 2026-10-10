export const workflowTemplateRegistry={
  "000":{title:"A first introduction",automatic:false},
  "001":{title:"Your personal proposal",automatic:false},
  "002":{title:"A thoughtful follow-up",automatic:true},
  "003":{title:"Staying in touch",automatic:true},
  "004":{title:"Welcome to our collaboration",automatic:false},
  "005":{title:"Your personal Client Portal",automatic:false},
  "006":{title:"Collaboration agreement",automatic:false},
  "007":{title:"A personal thank you",automatic:true},
  "008":{title:"Gallery delivery",automatic:false},
  "009":{title:"Organizing the schedule",automatic:true},
} as const;

export type WorkflowTemplateId=keyof typeof workflowTemplateRegistry;
export const automaticTemplateIds=(Object.entries(workflowTemplateRegistry).filter(([,item])=>item.automatic).map(([id])=>id)) as WorkflowTemplateId[];
