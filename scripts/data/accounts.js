window.ACCOUNT_DATA = [
  { name: 'Acme Corporation', city: 'San Francisco', state: 'CA', industry: 'Technology', type: 'Customer - Direct', phone: '(415) 555-1234',
    research: {
      bdrTeamSize: 25, bdrSource: { label: 'ZoomInfo', url: '#' },
      b2bSaas: true, b2bSaasSource: { label: 'Product Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 9, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'Bob Smith', callSentiment: 'Bob Smith was interested but timing was not right', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'they were looking to replace their current vendor', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Acme Corporation announced a $40M Series C funding round led by Sequoia Capital', source: { label: 'Tech Crunch', url: '#' } },
        { text: 'New VP of Engineering hired — previously led platform team at Stripe', source: { label: 'ZoomInfo', url: '#' } }
      ]
    },
    aopCriteria: [
      { title: "Account Selection", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Account", value: "Acme Corporation" },
          { field: "Condition", value: "None" },
          { field: "Status", value: "Passed" },
        ]},
      ]},
      { title: "Requirements", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Research ZoomInfo" },
          { field: "Condition", value: "BDR count ≥ 10" },
          { field: "Actual", value: "25" },
          { field: "Source", value: "Company API" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "team_size > 20" },
          { field: "Actual", value: "25" },
          { field: "Source", value: "Account Record" },
          { field: "Status", value: "Passed" },
        ]},
      ]},
      { title: "Nice-to-Haves", statusRule: "anyPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Website Research" },
          { field: "Condition", value: "SOC2 == True" },
          { field: "Actual", value: "True" },
          { field: "Source", value: "acmecorp.com/security" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "Demandbase score ≥ Medium" },
          { field: "Actual", value: "High" },
          { field: "Source", value: "CRM Lookup" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 3", thoughts: [
          { field: "Tool", value: "Check for Signals" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
        { subTitle: "Criteria 4", thoughts: [
          { field: "Tool", value: "Analyze Past Conversations" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
      ]},
    ]
  },
  { name: 'Burlington Textiles Corp of America', city: 'Burlington', state: 'NC', industry: 'Apparel', type: 'Customer - Direct', phone: '(336) 222-7000',
    research: {
      bdrTeamSize: 18, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 4, oppSource: { label: 'Salesforce', url: '#' }, calls: 5, contact: 'Lisa Chen', callSentiment: 'Lisa Chen was actively evaluating but chose a competitor', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'pricing was discussed and seemed within budget', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Launched new sustainable fabrics product line targeting eco-conscious retailers', source: { label: 'Web', url: '#' } },
        { text: 'Hiring 12 supply chain analysts — indicates digital transformation initiative', source: { label: 'ZoomInfo', url: '#' } }
      ]
    },
    aopCriteria: [
      { title: "Account Selection", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Account", value: "Burlington Textiles Corp of America" },
          { field: "Condition", value: "None" },
          { field: "Status", value: "Passed" },
        ]},
      ]},
      { title: "Requirements", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Research ZoomInfo" },
          { field: "Condition", value: "BDR count ≥ 10" },
          { field: "Actual", value: "18" },
          { field: "Source", value: "Company API" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "team_size > 20" },
          { field: "Actual", value: "18" },
          { field: "Source", value: "Account Record" },
          { field: "Status", value: "Fail" },
        ]},
      ]},
      { title: "Nice-to-Haves", statusRule: "anyPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Website Research" },
          { field: "Condition", value: "SOC2 == True" },
          { field: "Actual", value: "False" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "Fail" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "Demandbase score ≥ Medium" },
          { field: "Actual", value: "Medium" },
          { field: "Source", value: "CRM Lookup" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 3", thoughts: [
          { field: "Tool", value: "Check for Signals" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
        { subTitle: "Criteria 4", thoughts: [
          { field: "Tool", value: "Analyze Past Conversations" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
      ]},
    ]
  },
  { name: 'Dickenson plc', city: 'Lawrence', state: 'KS', industry: 'Consulting', type: 'Customer - Channel', phone: '(785) 241-6200',
    research: {
      bdrTeamSize: 12, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Dickenson plc expanded consulting practice into healthcare vertical', source: { label: 'Web', url: '#' } },
        { text: 'New CTO joined from Deloitte Digital — likely evaluating new tooling', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Recently added Salesforce and HubSpot to their tech stack', source: { label: '6sense', url: '#' } },
        { text: 'Opened a new office in Kansas City to support Midwest expansion', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'Edge Communications', city: 'Austin', state: 'TX', industry: 'Electronics', type: 'Customer - Direct', phone: '(512) 757-6000',
    research: {
      bdrTeamSize: 32, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 14, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Marcus Lee', callSentiment: 'Marcus Lee had budget constraints and asked to revisit next fiscal year', callSource: { label: 'Gong', url: '#' }, emails: 4, emailSentiment: 'they requested a detailed ROI analysis', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Edge Communications won "Best IoT Innovation" at CES 2026', source: { label: 'Web', url: '#' } },
        { text: 'Migrating legacy systems to AWS — 3 new DevOps roles posted', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Q4 revenue up 22% YoY driven by 5G component demand', source: { label: 'Moody\'s', url: '#' } }
      ]
    },
    aopCriteria: [
      { title: "Account Selection", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Account", value: "Edge Communications" },
          { field: "Condition", value: "None" },
          { field: "Status", value: "Passed" },
        ]},
      ]},
      { title: "Requirements", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Research ZoomInfo" },
          { field: "Condition", value: "BDR count ≥ 10" },
          { field: "Actual", value: "32" },
          { field: "Source", value: "Company API" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "team_size > 20" },
          { field: "Actual", value: "32" },
          { field: "Source", value: "Account Record" },
          { field: "Status", value: "Passed" },
        ]},
      ]},
      { title: "Nice-to-Haves", statusRule: "anyPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Website Research" },
          { field: "Condition", value: "SOC2 == True" },
          { field: "Actual", value: "True" },
          { field: "Source", value: "edgecomm.com/trust" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "Demandbase score ≥ Medium" },
          { field: "Actual", value: "High" },
          { field: "Source", value: "CRM Lookup" },
          { field: "Status", value: "Passed" },
        ]},
        { subTitle: "Criteria 3", thoughts: [
          { field: "Tool", value: "Check for Signals" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
        { subTitle: "Criteria 4", thoughts: [
          { field: "Tool", value: "Analyze Past Conversations" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
      ]},
    ]
  },
  { name: 'Express Logistics and Transport', city: 'Portland', state: 'OR', industry: 'Transportation', type: 'Customer - Channel', phone: '(503) 421-7800',
    research: {
      bdrTeamSize: 22, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 6, oppSource: { label: 'Salesforce', url: '#' }, calls: 1, contact: 'Janet Rivera', callSentiment: 'Janet Rivera showed interest but needed internal alignment', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'stakeholders expressed alignment on project timeline', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Announced partnership with FedEx for last-mile delivery in the Pacific Northwest', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Samsara fleet management platform across 200+ vehicles', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'GenePoint', city: 'Mountain View', state: 'CA', industry: 'Biotechnology', type: 'Customer - Channel', phone: '(650) 867-3450',
    research: {
      bdrTeamSize: 15, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'GenePoint received FDA breakthrough therapy designation for gene therapy candidate', source: { label: 'Web', url: '#' } },
        { text: 'Raised $85M in Series D from Andreessen Horowitz Bio Fund', source: { label: 'Web', url: '#' } },
        { text: 'Hiring 8 computational biologists — expanding AI-driven drug discovery', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Deployed Benchling as their lab informatics platform', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Grand Hotels & Resorts Ltd', city: 'Chicago', state: 'IL', industry: 'Hospitality', type: 'Customer - Direct', phone: '(312) 596-1000',
    research: {
      bdrTeamSize: 40, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 3, monthsAgo: 2, oppSource: { label: 'Salesforce', url: '#' }, calls: 7, contact: 'David Park', callSentiment: 'David Park is actively engaged and moving toward a decision', callSource: { label: 'Gong', url: '#' }, emails: 5, emailSentiment: 'executive sponsor confirmed this as a strategic priority', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Grand Hotels announced acquisition of 12 boutique properties across Europe', source: { label: 'Web', url: '#' } },
        { text: 'New Chief Digital Officer hired to lead guest experience transformation', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Rolling out contactless check-in powered by Oracle Hospitality across all locations', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'Greentech Renewables', city: 'Denver', state: 'CO', industry: 'Energy', type: 'Prospect', phone: '(720) 555-0198',
    research: {
      bdrTeamSize: 28, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Greentech Renewables secured $120M DOE grant for solar panel manufacturing', source: { label: 'Web', url: '#' } },
        { text: 'Expanding operations into Texas with a new 500,000 sq ft facility', source: { label: 'Web', url: '#' } },
        { text: 'VP of Sales departed — new leadership may re-evaluate vendor relationships', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Harbour Capital Partners', city: 'Boston', state: 'MA', industry: 'Financial Services', type: 'Customer - Direct', phone: '(617) 555-0142',
    research: {
      bdrTeamSize: 35, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 5, oppSource: { label: 'Salesforce', url: '#' }, calls: 4, contact: 'Sarah Kim', callSentiment: 'Sarah Kim was favorable but leadership changes delayed the deal', callSource: { label: 'Gong', url: '#' }, emails: 6, emailSentiment: 'team shared internal requirements document', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Harbour Capital launched a new $2B growth equity fund focused on fintech', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Bloomberg Terminal Enterprise and Refinitiv Eikon for research teams', source: { label: '6sense', url: '#' } },
        { text: 'New Managing Director of Operations hired from Goldman Sachs', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'AUM grew 35% YoY — indicates strong growth and potential for new tooling', source: { label: 'Moody\'s', url: '#' } }
      ]
    }
  },
  { name: 'Horizon Media Group', city: 'New York', state: 'NY', industry: 'Media', type: 'Customer - Channel', phone: '(212) 555-0167',
    research: {
      bdrTeamSize: 20, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: { count: 1, monthsAgo: 11, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Tom Brennan', callSentiment: 'Tom Brennan expressed initial interest but went dark after demo', callSource: { label: 'Gong', url: '#' }, emails: 1, emailSentiment: 'follow-up meeting was scheduled but later cancelled', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Horizon Media Group acquired a podcast network with 5M monthly listeners', source: { label: 'Web', url: '#' } },
        { text: 'Hiring a Head of Ad Tech — signals investment in programmatic capabilities', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Innovatech Solutions', city: 'Seattle', state: 'WA', industry: 'Technology', type: 'Prospect', phone: '(206) 555-0134',
    research: {
      bdrTeamSize: 45, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Innovatech Solutions raised $60M Series B to expand AI platform', source: { label: 'Web', url: '#' } },
        { text: 'Migrated from on-prem to Google Cloud Platform — posted 5 cloud architect roles', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Recently adopted Datadog for observability and monitoring', source: { label: '6sense', url: '#' } },
        { text: 'Named in Gartner\'s "Cool Vendors in AI for IT Operations"', source: { label: 'Web', url: '#' } },
        { text: 'Headcount grew 40% in last 6 months — rapid scaling phase', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Jackson & Associates', city: 'Atlanta', state: 'GA', industry: 'Consulting', type: 'Customer - Direct', phone: '(404) 555-0189',
    research: {
      bdrTeamSize: 10, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 3, oppSource: { label: 'Salesforce', url: '#' }, calls: 6, contact: 'Nina Patel', callSentiment: 'Nina Patel was very interested and requested a proposal', callSource: { label: 'Gong', url: '#' }, emails: 4, emailSentiment: 'contract terms were under review by legal', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Jackson & Associates won a $15M federal consulting contract with the VA', source: { label: 'Web', url: '#' } },
        { text: 'Adopted ServiceNow for internal workflow management', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Keystone Manufacturing', city: 'Pittsburgh', state: 'PA', industry: 'Manufacturing', type: 'Customer - Channel', phone: '(412) 555-0156',
    research: {
      bdrTeamSize: 30, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 7, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'Greg Foster', callSentiment: 'Greg Foster liked the product but procurement process was slow', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'procurement team raised compliance questions', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Keystone Manufacturing investing $25M in factory automation and robotics', source: { label: 'Web', url: '#' } },
        { text: 'New Director of IT hired from Siemens — likely modernizing tech stack', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Deployed SAP S/4HANA for ERP across 3 plant locations', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Lakewood Health Systems', city: 'Minneapolis', state: 'MN', industry: 'Healthcare', type: 'Customer - Direct', phone: '(612) 555-0178',
    research: {
      bdrTeamSize: 50, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 1, oppSource: { label: 'Salesforce', url: '#' }, calls: 8, contact: 'Dr. Amy Reeves', callSentiment: 'Dr. Amy Reeves is in final evaluation stage with strong champion support', callSource: { label: 'Gong', url: '#' }, emails: 5, emailSentiment: 'security audit documentation was requested', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Lakewood Health opened 3 new urgent care clinics across the Twin Cities', source: { label: 'Web', url: '#' } },
        { text: 'Awarded "Top 50 Health Systems" by Becker\'s Hospital Review', source: { label: 'Web', url: '#' } },
        { text: 'Migrating to Epic EHR system — $30M digital transformation underway', source: { label: 'Web', url: '#' } },
        { text: 'Hiring 6 data engineers for population health analytics team', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Meridian Financial Group', city: 'Charlotte', state: 'NC', industry: 'Financial Services', type: 'Customer - Direct', phone: '(704) 555-0145',
    research: {
      bdrTeamSize: 38, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Meridian Financial Group acquired a digital lending startup for $45M', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Plaid and Stripe for payment processing infrastructure', source: { label: '6sense', url: '#' } },
        { text: 'New Chief Risk Officer appointed — focused on AI-driven compliance', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'NovaTech Industries', city: 'Raleigh', state: 'NC', industry: 'Technology', type: 'Customer - Channel', phone: '(919) 555-0123',
    research: {
      bdrTeamSize: 22, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 10, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Kevin Dunn', callSentiment: 'Kevin Dunn was evaluating multiple vendors and chose to hold off', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'competitive evaluation criteria were shared', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'NovaTech Industries launched a new edge computing product line', source: { label: 'Web', url: '#' } },
        { text: 'Recently switched from Jira to Linear for product management', source: { label: '6sense', url: '#' } },
        { text: 'Senior Director of Partnerships left — role is still open', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Oceanic Airlines', city: 'Los Angeles', state: 'CA', industry: 'Transportation', type: 'Prospect', phone: '(310) 555-0191',
    research: {
      bdrTeamSize: 55, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Oceanic Airlines added 15 new domestic routes and ordered 20 Boeing 737 MAX jets', source: { label: 'Web', url: '#' } },
        { text: 'Launched a loyalty program revamp powered by Braze and Amplitude', source: { label: '6sense', url: '#' } },
        { text: 'New CIO hired from Delta Air Lines — modernizing IT infrastructure', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Annual revenue exceeded $8B for the first time', source: { label: 'Moody\'s', url: '#' } }
      ]
    }
  },
  { name: 'Pacific Rim Trading Co.', city: 'San Diego', state: 'CA', industry: 'Retail', type: 'Customer - Direct', phone: '(619) 555-0168',
    research: {
      bdrTeamSize: 14, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: { count: 1, monthsAgo: 8, oppSource: { label: 'Salesforce', url: '#' }, calls: 1, contact: 'Rachel Tanaka', callSentiment: 'Rachel Tanaka was interested but needed a different pricing tier', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'they asked about customer references in retail', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Pacific Rim Trading launched a new e-commerce storefront on Shopify Plus', source: { label: '6sense', url: '#' } },
        { text: 'Expanding into Japanese market with new import partnerships', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'Pinnacle Construction Inc.', city: 'Phoenix', state: 'AZ', industry: 'Construction', type: 'Customer - Channel', phone: '(480) 555-0137',
    research: {
      bdrTeamSize: 16, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: null,
      signals: [
        { text: 'Pinnacle Construction won a $50M contract for a Phoenix mixed-use development', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Procore for construction management across all projects', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Pyramid Construction Inc.', city: 'Dallas', state: 'TX', industry: 'Construction', type: 'Customer - Channel', phone: '(214) 427-4427',
    research: {
      bdrTeamSize: 19, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 12, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Mike Torres', callSentiment: 'Mike Torres had a brief evaluation but decided it was not the right fit', callSource: { label: 'Gong', url: '#' }, emails: 1, emailSentiment: 'they benchmarked against three other vendors', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Pyramid Construction expanding into commercial solar panel installation', source: { label: 'Web', url: '#' } },
        { text: 'Hiring a VP of Technology — first-ever dedicated tech leadership role', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Quantum Analytics', city: 'San Jose', state: 'CA', industry: 'Technology', type: 'Customer - Direct', phone: '(408) 555-0152',
    research: {
      bdrTeamSize: 42, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 3, oppSource: { label: 'Salesforce', url: '#' }, calls: 5, contact: 'Elena Vasquez', callSentiment: 'Elena Vasquez was highly engaged and is ready to re-engage this quarter', callSource: { label: 'Gong', url: '#' }, emails: 7, emailSentiment: 'technical requirements were well-aligned with our platform', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Quantum Analytics launched a real-time ML inference product for enterprise', source: { label: 'Web', url: '#' } },
        { text: 'Deployed Kubernetes and Istio service mesh across production workloads', source: { label: '6sense', url: '#' } },
        { text: 'New VP of Sales hired from Databricks — rebuilding go-to-market motion', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Featured in Forbes "AI 50" list of most promising AI companies', source: { label: 'Web', url: '#' } },
        { text: 'Engineering team grew from 80 to 140 in last two quarters', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Redwood Materials', city: 'Carson City', state: 'NV', industry: 'Manufacturing', type: 'Prospect', phone: '(775) 555-0184',
    research: {
      bdrTeamSize: 33, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Redwood Materials secured $700M in funding for battery recycling expansion', source: { label: 'Web', url: '#' } },
        { text: 'Partnered with Panasonic for closed-loop battery material supply chain', source: { label: 'Web', url: '#' } },
        { text: 'Building a second recycling facility in South Carolina — 500 new jobs', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Palantir Foundry for supply chain analytics', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Salesforce.com, Inc.', city: 'San Francisco', state: 'CA', industry: 'Technology', type: 'Customer - Direct', phone: '(415) 901-7000',
    research: {
      bdrTeamSize: 75, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 4, monthsAgo: 1, oppSource: { label: 'Salesforce', url: '#' }, calls: 12, contact: 'Jordan Blake', callSentiment: 'Jordan Blake is an active opportunity with multiple stakeholders involved', callSource: { label: 'Gong', url: '#' }, emails: 9, emailSentiment: 'integration requirements were discussed in detail', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Salesforce announced Agentforce platform at Dreamforce 2025', source: { label: 'Web', url: '#' } },
        { text: 'Revenue exceeded $40B annually — continued enterprise market dominance', source: { label: 'Moody\'s', url: '#' } },
        { text: 'Acquired a data integration startup for $1.5B to bolster Data Cloud', source: { label: 'Tech Crunch', url: '#' } }
      ]
    }
  },
  { name: 'sForce', city: 'San Francisco', state: 'CA', industry: 'Technology', type: 'Partner', phone: '(415) 901-7000',
    research: {
      bdrTeamSize: 60, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 2, oppSource: { label: 'Salesforce', url: '#' }, calls: 4, contact: 'Alex Morgan', callSentiment: 'Alex Morgan was exploring partnership opportunities and is open to next steps', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'partnership revenue model was outlined', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'sForce launched new ISV partner program with enhanced revenue sharing', source: { label: 'Web', url: '#' } },
        { text: 'New Head of Alliances hired — previously ran channel at ServiceNow', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Deployed Terraform and GitHub Actions for infrastructure automation', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Sierra Wireless Networks', city: 'Salt Lake City', state: 'UT', industry: 'Telecommunications', type: 'Customer - Direct', phone: '(801) 555-0129',
    research: {
      bdrTeamSize: 27, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Sierra Wireless expanding 5G fixed wireless access to rural communities', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Cisco Meraki for network management across 50+ cell sites', source: { label: '6sense', url: '#' } },
        { text: 'Hiring 10 RF engineers — scaling network buildout', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Summit Healthcare Partners', city: 'Nashville', state: 'TN', industry: 'Healthcare', type: 'Customer - Channel', phone: '(615) 555-0173',
    research: {
      bdrTeamSize: 34, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 5, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'Dr. Chris Yang', callSentiment: 'Dr. Chris Yang showed strong interest but compliance review took longer than expected', callSource: { label: 'Gong', url: '#' }, emails: 4, emailSentiment: 'HIPAA compliance requirements were discussed at length', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Summit Healthcare merged with a regional hospital network — now 12 facilities', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Cerner Millennium for clinical records management', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'Terracotta Designs', city: 'Santa Fe', state: 'NM', industry: 'Retail', type: 'Customer - Direct', phone: '(505) 555-0146',
    research: {
      bdrTeamSize: 8, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: null,
      signals: [
        { text: 'Terracotta Designs launched direct-to-consumer channel with 300% growth in online sales', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'TrueNorth Logistics', city: 'Anchorage', state: 'AK', industry: 'Transportation', type: 'Customer - Channel', phone: '(907) 555-0162',
    research: {
      bdrTeamSize: 21, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 15, oppSource: { label: 'Salesforce', url: '#' }, calls: 1, contact: 'Brian Holt', callSentiment: 'Brian Holt had a brief intro call but did not move forward', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'they outlined a phased rollout plan', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'TrueNorth Logistics expanded Arctic freight operations with new icebreaker fleet', source: { label: 'Web', url: '#' } },
        { text: 'Adopted FourKites for real-time supply chain visibility', source: { label: '6sense', url: '#' } },
        { text: 'New VP of Operations hired from Maersk — modernizing logistics tech', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'United Oil & Gas Corp.', city: 'New York', state: 'NY', industry: 'Energy', type: 'Customer - Direct', phone: '(212) 842-5500',
    research: {
      bdrTeamSize: 65, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 4, oppSource: { label: 'Salesforce', url: '#' }, calls: 6, contact: 'Patricia Shaw', callSentiment: 'Patricia Shaw was in advanced negotiations but deal stalled due to restructuring', callSource: { label: 'Gong', url: '#' }, emails: 5, emailSentiment: 'vendor comparison matrix was circulated internally', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'United Oil & Gas investing $2B in renewable energy division over next 3 years', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Microsoft Azure for upstream data analytics and modeling', source: { label: '6sense', url: '#' } },
        { text: 'Chief Sustainability Officer appointed — first C-suite ESG role', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Q3 earnings beat analyst estimates by 18% on strong natural gas demand', source: { label: 'Moody\'s', url: '#' } }
      ]
    }
  },
  { name: 'United Oil & Gas, Singapore', city: 'Singapore', state: 'Singapore', industry: 'Energy', type: 'Customer - Direct', phone: '(650) 450-8810',
    research: {
      bdrTeamSize: 48, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Opened a new LNG trading desk in Singapore to serve Asia-Pacific markets', source: { label: 'Web', url: '#' } },
        { text: 'Partnered with Petronas for offshore exploration in the South China Sea', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'United Oil & Gas, UK', city: 'London', state: 'UK', industry: 'Energy', type: 'Customer - Direct', phone: '+44 191 4956203',
    research: {
      bdrTeamSize: 52, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 6, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'James Whitfield', callSentiment: 'James Whitfield was interested but needed GDPR-specific documentation first', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'GDPR compliance documentation was shared for review', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Awarded North Sea drilling license for 3 new exploration blocks', source: { label: 'Web', url: '#' } },
        { text: 'Investing in carbon capture and storage technology with UK government backing', source: { label: 'Web', url: '#' } },
        { text: 'Hired a new Data Protection Officer to lead GDPR compliance overhaul', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'University of Arizona', city: 'Tucson', state: 'AZ', industry: 'Education', type: 'Customer - Direct', phone: '(520) 773-9050',
    research: {
      bdrTeamSize: 11, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: { count: 1, monthsAgo: 18, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Prof. Maria Gonzalez', callSentiment: 'Prof. Maria Gonzalez explored a pilot program but funding was not approved', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'pilot program scope and budget were discussed', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'University of Arizona received a $10M NSF grant for AI research center', source: { label: 'Web', url: '#' } },
        { text: 'Deployed Canvas LMS and Zoom for hybrid learning across all departments', source: { label: '6sense', url: '#' } },
        { text: 'New Provost focused on expanding industry partnerships and tech transfer', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Vanguard Real Estate', city: 'Miami', state: 'FL', industry: 'Real Estate', type: 'Prospect', phone: '(305) 555-0138',
    research: {
      bdrTeamSize: 24, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Vanguard Real Estate closed $400M in commercial property acquisitions in South Florida', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Yardi Voyager for property management and accounting', source: { label: '6sense', url: '#' } },
        { text: 'Hiring a VP of Data Analytics — first dedicated analytics leadership hire', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Vertex Pharmaceuticals', city: 'Boston', state: 'MA', industry: 'Healthcare', type: 'Customer - Direct', phone: '(617) 555-0195',
    research: {
      bdrTeamSize: 58, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 3, monthsAgo: 2, oppSource: { label: 'Salesforce', url: '#' }, calls: 9, contact: 'Dr. Ryan Cho', callSentiment: 'Dr. Ryan Cho is an active champion pushing for executive buy-in', callSource: { label: 'Gong', url: '#' }, emails: 6, emailSentiment: 'internal champion confirmed strong executive support', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Vertex Pharmaceuticals received FDA approval for a new gene editing therapy', source: { label: 'Web', url: '#' } },
        { text: 'R&D budget increased 25% to $3.2B — investing heavily in rare disease pipeline', source: { label: 'Moody\'s', url: '#' } },
        { text: 'Adopted Veeva Vault for clinical trial data management', source: { label: '6sense', url: '#' } },
        { text: 'New SVP of Commercial Strategy hired from Moderna', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Announced expansion of Boston HQ with 200,000 sq ft of new lab space', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'Wavefront Technologies', city: 'Austin', state: 'TX', industry: 'Technology', type: 'Customer - Channel', phone: '(512) 555-0181',
    research: {
      bdrTeamSize: 29, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 7, oppSource: { label: 'Salesforce', url: '#' }, calls: 4, contact: 'Samantha Lee', callSentiment: 'Samantha Lee completed a POC but integration concerns delayed decision', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'API integration capabilities were a key topic', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Wavefront Technologies open-sourced their observability framework on GitHub', source: { label: 'Web', url: '#' } },
        { text: 'Switched from Elasticsearch to ClickHouse for log analytics', source: { label: '6sense', url: '#' } },
        { text: 'Headcount grew 30% in Austin office — hiring across engineering and sales', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Westfield Insurance', city: 'Columbus', state: 'OH', industry: 'Insurance', type: 'Customer - Direct', phone: '(614) 555-0157',
    research: {
      bdrTeamSize: 36, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Westfield Insurance launched AI-powered claims processing — 40% faster turnaround', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Guidewire ClaimCenter for end-to-end claims management', source: { label: '6sense', url: '#' } },
        { text: 'New Chief Technology Officer hired from Progressive Insurance', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Expanding into 5 new states with commercial lines products', source: { label: 'Web', url: '#' } }
      ]
    }
  },
  { name: 'Xenon Biotech', city: 'San Diego', state: 'CA', industry: 'Biotechnology', type: 'Prospect', phone: '(858) 555-0143',
    research: {
      bdrTeamSize: 17, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Xenon Biotech entered Phase 2 clinical trials for a novel immunotherapy drug', source: { label: 'Web', url: '#' } },
        { text: 'Raised $35M Series B led by Arch Venture Partners', source: { label: 'Web', url: '#' } },
        { text: 'Deployed AWS for genomics data processing pipelines', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Yellowstone Capital', city: 'Boise', state: 'ID', industry: 'Financial Services', type: 'Customer - Channel', phone: '(208) 555-0176',
    research: {
      bdrTeamSize: 13, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: { count: 1, monthsAgo: 10, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Derek Olsen', callSentiment: 'Derek Olsen was interested but team was too small at the time', callSource: { label: 'Gong', url: '#' }, emails: 1, emailSentiment: 'decision was delayed pending board approval', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Yellowstone Capital opened new branch offices in Boise and Spokane', source: { label: 'Web', url: '#' } },
        { text: 'New Director of Business Development joined from Edward Jones', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Zenith Electronics', city: 'Detroit', state: 'MI', industry: 'Electronics', type: 'Customer - Direct', phone: '(313) 555-0169',
    research: {
      bdrTeamSize: 31, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 3, oppSource: { label: 'Salesforce', url: '#' }, calls: 5, contact: 'Angela Martin', callSentiment: 'Angela Martin is ready to move forward pending legal review', callSource: { label: 'Gong', url: '#' }, emails: 4, emailSentiment: 'demo feedback was positive across the team', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Zenith Electronics unveiled a new line of smart home devices at CES 2026', source: { label: 'Web', url: '#' } },
        { text: 'Partnered with NVIDIA for embedded AI chip integration', source: { label: 'Web', url: '#' } },
        { text: 'Adopted PTC Windchill for product lifecycle management', source: { label: '6sense', url: '#' } },
        { text: 'Hiring 15 firmware engineers — ramping up IoT product development', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Atlas Supply Chain', city: 'Memphis', state: 'TN', industry: 'Transportation', type: 'Customer - Direct', phone: '(901) 555-0132',
    research: {
      bdrTeamSize: 26, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 13, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'Carlos Mendez', callSentiment: 'Carlos Mendez was evaluating but a reorg shifted priorities', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'total cost of ownership analysis was requested', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Atlas Supply Chain opened a 1M sq ft distribution center in Memphis', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Manhattan Associates WMS for warehouse management', source: { label: '6sense', url: '#' } },
        { text: 'New SVP of Technology hired from FedEx Supply Chain', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Beacon Analytics', city: 'Omaha', state: 'NE', industry: 'Technology', type: 'Customer - Channel', phone: '(402) 555-0148',
    research: {
      bdrTeamSize: 19, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Beacon Analytics launched a self-service BI platform for mid-market companies', source: { label: 'Web', url: '#' } },
        { text: 'Raised $20M Series A from Insight Partners', source: { label: 'Web', url: '#' } },
        { text: 'Recently migrated data infrastructure to Databricks Lakehouse', source: { label: '6sense', url: '#' } },
        { text: 'Hiring 8 data scientists and ML engineers in Omaha', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Cascade Water Systems', city: 'Olympia', state: 'WA', industry: 'Utilities', type: 'Customer - Direct', phone: '(360) 555-0187',
    research: {
      bdrTeamSize: 23, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: { count: 1, monthsAgo: 8, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'Laura Simmons', callSentiment: 'Laura Simmons was interested but needed a public sector-specific solution', callSource: { label: 'Gong', url: '#' }, emails: 3, emailSentiment: 'public sector procurement process was outlined', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Cascade Water Systems awarded $30M state contract for water treatment upgrades', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Itron smart meter technology across 50,000 residential connections', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'DeltaWing Aerospace', city: 'Huntsville', state: 'AL', industry: 'Aerospace', type: 'Prospect', phone: '(256) 555-0159',
    research: {
      bdrTeamSize: 44, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'DeltaWing Aerospace won a $200M NASA contract for next-gen propulsion systems', source: { label: 'Web', url: '#' } },
        { text: 'Expanding Huntsville facility with new 100,000 sq ft testing lab', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Siemens NX for digital twin and simulation workflows', source: { label: '6sense', url: '#' } },
        { text: 'New VP of Engineering joined from SpaceX — signals innovation push', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Hiring 25 aerospace engineers for satellite communications program', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Ember Hospitality Group', city: 'Las Vegas', state: 'NV', industry: 'Hospitality', type: 'Customer - Direct', phone: '(702) 555-0174',
    research: {
      bdrTeamSize: 37, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 2, monthsAgo: 4, oppSource: { label: 'Salesforce', url: '#' }, calls: 4, contact: 'Tony Russo', callSentiment: 'Tony Russo was negotiating terms but deal fell through due to budget cuts', callSource: { label: 'Gong', url: '#' }, emails: 6, emailSentiment: 'budget reallocation timeline was discussed', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Ember Hospitality opened 2 new luxury resorts on the Las Vegas Strip', source: { label: 'Web', url: '#' } },
        { text: 'Implemented Oracle OPERA PMS across all 15 properties', source: { label: '6sense', url: '#' } },
        { text: 'Revenue per available room (RevPAR) up 15% — indicates strong demand', source: { label: 'Moody\'s', url: '#' } }
      ]
    }
  },
  { name: 'Frontier AgriTech', city: 'Des Moines', state: 'IA', industry: 'Agriculture', type: 'Customer - Channel', phone: '(515) 555-0126',
    research: {
      bdrTeamSize: 9, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: null,
      signals: [
        { text: 'Frontier AgriTech launched precision agriculture drone service for Midwest farms', source: { label: 'Web', url: '#' } },
        { text: 'Adopted John Deere Operations Center for farm management analytics', source: { label: '6sense', url: '#' } }
      ]
    },
    aopCriteria: [
      { title: "Account Selection", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Account", value: "Frontier AgriTech" },
          { field: "Condition", value: "None" },
          { field: "Status", value: "Passed" },
        ]},
      ]},
      { title: "Requirements", statusRule: "allPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Research ZoomInfo" },
          { field: "Condition", value: "BDR count ≥ 10" },
          { field: "Actual", value: "9" },
          { field: "Source", value: "ZoomInfo" },
          { field: "Status", value: "Fail" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "team_size > 20" },
          { field: "Actual", value: "9" },
          { field: "Source", value: "Account Record" },
          { field: "Status", value: "Fail" },
        ]},
      ]},
      { title: "Nice-to-Haves", statusRule: "anyPass", sections: [
        { subTitle: "Criteria 1", thoughts: [
          { field: "Tool", value: "Website Research" },
          { field: "Condition", value: "SOC2 == True" },
          { field: "Actual", value: "False" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "Fail" },
        ]},
        { subTitle: "Criteria 2", thoughts: [
          { field: "Tool", value: "CRM Lookup" },
          { field: "Condition", value: "Demandbase score ≥ Medium" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "Fail" },
        ]},
        { subTitle: "Criteria 3", thoughts: [
          { field: "Tool", value: "Check for Signals" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
        { subTitle: "Criteria 4", thoughts: [
          { field: "Tool", value: "Analyze Past Conversations" },
          { field: "Condition", value: "n/a" },
          { field: "Actual", value: "n/a" },
          { field: "Source", value: "n/a" },
          { field: "Status", value: "n/a" },
        ]},
      ]},
    ]
  },
  { name: 'Global Media Ventures', city: 'Los Angeles', state: 'CA', industry: 'Media', type: 'Customer - Direct', phone: '(213) 555-0193',
    research: {
      bdrTeamSize: 41, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Trust Page', url: '#' },
      demandbaseScore: 'High', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 6, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'Megan Frost', callSentiment: 'Megan Frost completed evaluation but contract terms needed revision', callSource: { label: 'Gong', url: '#' }, emails: 5, emailSentiment: 'scalability requirements for streaming were shared', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Global Media Ventures acquired a streaming platform with 2M subscribers', source: { label: 'Web', url: '#' } },
        { text: 'Deployed AWS MediaLive for content delivery infrastructure', source: { label: '6sense', url: '#' } },
        { text: 'New Head of Ad Revenue hired from Disney Advertising Sales', source: { label: 'ZoomInfo', url: '#' } },
        { text: 'Digital advertising revenue grew 45% YoY in latest quarter', source: { label: 'Moody\'s', url: '#' } }
      ]
    }
  },
  { name: 'Highland Consulting', city: 'Richmond', state: 'VA', industry: 'Consulting', type: 'Customer - Direct', phone: '(804) 555-0141',
    research: {
      bdrTeamSize: 15, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Security Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: null,
      signals: [
        { text: 'Highland Consulting won a multi-year contract with the Department of Defense', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Monday.com for project management across consulting teams', source: { label: '6sense', url: '#' } },
        { text: 'Hiring 5 management consultants with cloud migration expertise', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Ironbridge Capital', city: 'Hartford', state: 'CT', industry: 'Financial Services', type: 'Prospect', phone: '(860) 555-0166',
    research: {
      bdrTeamSize: 29, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: true, soc2Source: { label: 'Compliance Page', url: '#' },
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 11, oppSource: { label: 'Salesforce', url: '#' }, calls: 2, contact: 'William Hart', callSentiment: 'William Hart attended a webinar and requested follow-up but went silent', callSource: { label: 'Gong', url: '#' }, emails: 2, emailSentiment: 'risk management use cases were explored', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Ironbridge Capital launched a $500M infrastructure investment fund', source: { label: 'Web', url: '#' } },
        { text: 'Adopted BlackRock Aladdin for portfolio risk management', source: { label: '6sense', url: '#' } }
      ]
    }
  },
  { name: 'Jupiter Communications', city: 'Tampa', state: 'FL', industry: 'Telecommunications', type: 'Customer - Channel', phone: '(813) 555-0153',
    research: {
      bdrTeamSize: 20, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: 'Medium', demandbaseSource: { label: 'Demandbase', url: '#' },
      pastOpp: { count: 1, monthsAgo: 9, oppSource: { label: 'Salesforce', url: '#' }, calls: 3, contact: 'Diana Voss', callSentiment: 'Diana Voss was interested but their current contract had 6 months remaining', callSource: { label: 'Gong', url: '#' }, emails: 1, emailSentiment: 'contract renewal timeline was a key factor', emailSource: { label: 'Gmail', url: '#' } },
      signals: [
        { text: 'Jupiter Communications rolled out fiber-to-the-home in 3 new Florida markets', source: { label: 'Web', url: '#' } },
        { text: 'Partnered with Nokia for 5G core network deployment', source: { label: 'Web', url: '#' } },
        { text: 'Hiring a Director of Network Architecture — indicates infrastructure investment', source: { label: 'ZoomInfo', url: '#' } }
      ]
    }
  },
  { name: 'Keystone Brewing Company', city: 'Philadelphia', state: 'PA', industry: 'Food & Beverage', type: 'Customer - Direct', phone: '(215) 555-0185',
    research: {
      bdrTeamSize: 11, bdrSource: { label: 'ZoomInfo', url: '#' },
      soc2: false, soc2Source: null,
      demandbaseScore: null, demandbaseSource: null,
      pastOpp: null,
      signals: [
        { text: 'Keystone Brewing won "Best Craft Brewery" at the Great American Beer Festival', source: { label: 'Web', url: '#' } },
        { text: 'Launched a hard seltzer line targeting the health-conscious market', source: { label: 'Web', url: '#' } },
        { text: 'Adopted Toast POS system across taproom and distribution operations', source: { label: '6sense', url: '#' } }
      ]
    }
  }
];

window.ACCOUNT_DATA.forEach(function(account) {
  if (!account.reasoning) {
    account.reasoning = "The user wants me to research " + account.name + " and qualify it based on their instructions. I need to read their requirements and make sure I have the tools needed to fully answer it. Then I can check their nice-to-haves for additional contact.";
  }
});

// ---- Evidence Generation (popover data per source badge) ----
window.ACCOUNT_DATA.forEach(function(account) {
  var r = account.research;
  if (!r) return;

  if (r.bdrTeamSize != null && !r.bdrEvidence) {
    r.bdrEvidence = {
      tool: 'Research ZoomInfo',
      search: 'The # of BDR/SDR job titles within company',
      result: String(r.bdrTeamSize)
    };
  }

  if (r.b2bSaas && r.b2bSaasSource && !r.b2bSaasEvidence) {
    var domain = account.name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
    r.b2bSaasEvidence = {
      tool: 'Website Research',
      title: account.name + ' B2B SaaS Platform',
      url: domain + '/product',
      snippet: account.name + ' offers an enterprise-grade SaaS platform purpose-built for B2B teams, featuring multi-tenant architecture, role-based access, and out-of-the-box integrations with leading CRM and marketing automation tools.'
    };
  }

  if (r.soc2 && r.soc2Source && !r.soc2Evidence) {
    var domain = account.name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
    r.soc2Evidence = {
      tool: 'Website Research',
      title: account.name + ' SOC 2 Compliance',
      url: domain + '/security',
      snippet: account.name + ' has achieved Service Organization Control (SOC) 2 Type II compliance, demonstrating commitment to the highest standards of security and data protection for customers.'
    };
  }

  if (r.demandbaseScore && !r.demandbaseEvidence) {
    r.demandbaseEvidence = {
      tool: 'Lookup CRM',
      recordName: account.name,
      fields: [
        { label: 'Demandbase Score', value: r.demandbaseScore },
        { label: 'Industry', value: account.industry || 'N/A' },
        { label: 'Type', value: account.type || 'N/A' }
      ]
    };
  }

  if (r.pastOpp) {
    var opp = r.pastOpp;
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (!opp.oppEvidence) {
      var closeDate = new Date();
      closeDate.setMonth(closeDate.getMonth() - opp.monthsAgo);
      opp.oppEvidence = {
        tool: 'Lookup CRM',
        recordName: account.name + ' - Enterprise',
        fields: [
          { label: 'Stage', value: 'Closed Lost' },
          { label: 'Close date', value: monthNames[closeDate.getMonth()] + ' ' + closeDate.getFullYear() },
          { label: 'Owner', value: opp.contact || 'Unassigned' }
        ]
      };
    }

    if (opp.calls && opp.callSentiment && !opp.callEvidence) {
      opp.callEvidence = {
        tool: 'Analyze Past Conversations',
        conversations: [{
          title: 'Sales Call with ' + (opp.contact || 'Contact'),
          contact: opp.contact || 'Unknown',
          date: '',
          quote: '"...' + opp.callSentiment + '..."'
        }]
      };
    }

    if (opp.emails && opp.emailSentiment && !opp.emailEvidence) {
      opp.emailEvidence = {
        tool: 'Analyze Past Conversations',
        conversations: [{
          title: 'Email Thread',
          contact: opp.contact || 'Unknown',
          date: '',
          quote: '"...' + opp.emailSentiment + '..."'
        }]
      };
    }
  }

  if (r.signals) {
    r.signals.forEach(function(signal) {
      if (signal.evidence) return;
      var text = signal.text || '';
      var search = 'Relevant signals for ' + account.name;

      if (/fund|rais|series|invest|grant|capital/i.test(text)) {
        search = 'Funding or investment activity for company';
      } else if (/hir|hire|hired|job|role|recruit|headcount/i.test(text)) {
        search = 'For any Hiring Trends within company';
      } else if (/adopt|deploy|migrat|switch|implement|launch/i.test(text)) {
        search = 'Technology adoption and infrastructure changes';
      } else if (/expand|open|acqui|partner|merge|facilit/i.test(text)) {
        search = 'Business expansion and growth signals';
      } else if (/revenue|earn|grew|growth|award|named|won\b/i.test(text)) {
        search = 'Financial performance and industry recognition';
      }

      signal.evidence = {
        tool: 'Check For Signals',
        search: search,
        result: text
      };
    });
  }
});

// Acme Corporation — hand-crafted evidence matching blank.html designs
(function() {
  var acme = window.ACCOUNT_DATA.find(function(a) { return a.name === 'Acme Corporation'; });
  if (!acme || !acme.research) return;
  var r = acme.research;

  r.bdrEvidence = {
    tool: 'Research ZoomInfo',
    search: 'The # of BDR/SDR job titles within company',
    result: '25'
  };

  r.soc2Evidence = {
    tool: 'Website Research',
    title: 'Acme Corp is now SOC2 compliant',
    url: 'acme.com/security',
    snippet: 'Acme Corp, a leading provider of enterprise workflow solutions, today announced that it has successfully achieved Service Organization Control (SOC) 2 Type II compliance.'
  };

  r.demandbaseEvidence = {
    tool: 'Lookup CRM',
    recordName: 'Acme Corporation',
    fields: [
      { label: 'Owner', value: 'Freddy Krueger' },
      { label: 'Demandbase Score', value: 'High' },
      { label: 'Last Modified', value: 'Jan 2, 2025' }
    ]
  };

  var opp = r.pastOpp;
  if (opp) {
    opp.oppEvidence = {
      tool: 'Lookup CRM',
      recordName: 'Acme Corp - Enterprise',
      fields: [
        { label: 'Stage', value: 'Closed Lost' },
        { label: 'Close date', value: 'Jun 2025' },
        { label: 'Amount', value: '$180,000' }
      ]
    };

    opp.callEvidence = {
      tool: 'Analyze Past Conversations',
      conversations: [
        { title: 'Re: Pricing', contact: 'Bob Smith', date: 'Mar 2, 2025', quote: '"...Your platform looks very promising, but we do not have the budget available to explore new tools right now. Reach out back in Q4 when our financial cycle has reset..."' },
        { title: 'Re: Follow Up', contact: 'Bob Smith', date: 'Feb 14, 2025', quote: '"...We had a good discussion about your product. The team liked the demo but timing isn\'t right..."' }
      ]
    };

    opp.emailEvidence = {
      tool: 'Analyze Past Conversations',
      conversations: [
        { title: 'Re: Vendor Evaluation', contact: 'Bob Smith', date: 'Apr 10, 2025', quote: '"...We are currently happy with our existing vendor and I don\'t see a compelling reason to switch platforms at this time..."' },
        { title: 'Re: Docusign Quote', contact: 'Amanda Perez', date: 'Mar 2, 2025', quote: '"...We are currently happy with our existing vendor and I don\'t see a compelling reason to switch platforms at this time..."' }
      ]
    };
  }

  r.signals[0].evidence = { tool: 'Check For Signals', search: 'Funding or investment activity for company', result: '$40M Series C from Sequoia Capital' };
  r.signals[1].evidence = { tool: 'Check For Signals', search: 'For any Hiring Trends within company', result: 'New VP of Engineering — previously led platform team at Stripe' };
})();

// Generate aopCriteria for accounts that don't already have hand-crafted data
window.ACCOUNT_DATA.forEach(function(account) {
  if (account.aopCriteria) return;
  var r = account.research;
  if (!r) return;

  var bdrStatus = (r.bdrTeamSize >= 10) ? "Passed" : "Fail";
  var teamStatus = (r.bdrTeamSize > 20) ? "Passed" : "Fail";
  var soc2Status = r.soc2 ? "Passed" : "Fail";
  var demandbaseStatus = (r.demandbaseScore === "Medium" || r.demandbaseScore === "High") ? "Passed" : "Fail";

  account.aopCriteria = [
    { title: "Account Selection", statusRule: "allPass", sections: [
      { subTitle: "Criteria 1", thoughts: [
        { field: "Account", value: account.name },
        { field: "Condition", value: "None" },
        { field: "Status", value: "Passed" },
      ]},
    ]},
    { title: "Requirements", statusRule: "allPass", sections: [
      { subTitle: "Criteria 1", thoughts: [
        { field: "Tool", value: "Research ZoomInfo" },
        { field: "Condition", value: "BDR count ≥ 10" },
        { field: "Actual", value: String(r.bdrTeamSize) },
        { field: "Source", value: "Company API" },
        { field: "Status", value: bdrStatus },
      ]},
      { subTitle: "Criteria 2", thoughts: [
        { field: "Tool", value: "CRM Lookup" },
        { field: "Condition", value: "team_size > 20" },
        { field: "Actual", value: String(r.bdrTeamSize) },
        { field: "Source", value: "Account Record" },
        { field: "Status", value: teamStatus },
      ]},
    ]},
    { title: "Nice-to-Haves", statusRule: "anyPass", sections: [
      { subTitle: "Criteria 1", thoughts: [
        { field: "Tool", value: "Website Research" },
        { field: "Condition", value: "SOC2 == True" },
        { field: "Actual", value: r.soc2 ? "True" : "False" },
        { field: "Source", value: (r.soc2Source && r.soc2Source.url) ? r.soc2Source.url : "n/a" },
        { field: "Status", value: soc2Status },
      ]},
      { subTitle: "Criteria 2", thoughts: [
        { field: "Tool", value: "CRM Lookup" },
        { field: "Condition", value: "Demandbase score ≥ Medium" },
        { field: "Actual", value: r.demandbaseScore || "n/a" },
        { field: "Source", value: r.demandbaseScore ? "CRM Lookup" : "n/a" },
        { field: "Status", value: demandbaseStatus },
      ]},
      { subTitle: "Criteria 3", thoughts: [
        { field: "Tool", value: "Check for Signals" },
        { field: "Condition", value: "n/a" },
        { field: "Actual", value: "n/a" },
        { field: "Source", value: "n/a" },
        { field: "Status", value: "n/a" },
      ]},
      { subTitle: "Criteria 4", thoughts: [
        { field: "Tool", value: "Analyze Past Conversations" },
        { field: "Condition", value: "n/a" },
        { field: "Actual", value: "n/a" },
        { field: "Source", value: "n/a" },
        { field: "Status", value: "n/a" },
      ]},
    ]},
  ];
});
