/**
 * Prospect (people) data for the Find Prospects step preview.
 * Keyed by account name so prospects are discoverable per account.
 */

window.PROSPECT_DATA = window.PROSPECT_DATA || {};

(function () {
  const byAccount = {
    "Acme Corporation": {
      reasoning: "The user wants me to find prospects at Acme Corporation who match their ICP. I need to search for contacts in Sales, Revenue Ops, and Business Development leadership roles. Then I'll score each prospect based on title match, seniority, and CRM duplicate status.",
      prospects: [
        {
          name: "Sarah Chen",
          title: "VP of Sales",
          email: "s.chen@acmecorp.com",
          phone: "(415) 555-0142",
          department: "Sales",
          seniority: "VP",
          score: 92,
          source: { label: "ZoomInfo" },
          reason: "Decision maker, actively hiring BDRs",
          bullets: [
            { text: "Revenue leadership and enterprise pipeline ownership", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Sarah Chen VP Sales Acme Corp", result: "Sarah Chen has been VP of Sales at Acme Corporation since 2022, overseeing a team of 40+ and managing $25M in annual pipeline." } },
            { text: "Previously engaged contact 9 months ago", source: { label: "Email" }, evidence: { tool: "Analyze Past Conversations", conversations: [{ title: "Re: Q3 Pipeline Review", contact: "Sarah Chen", date: "Nov 14, 2024", quote: "\"...Your platform looks very promising. Let's revisit this in Q2 when we have more budget flexibility...\"" }] } },
            { text: "Verified contact data using ZoomInfo", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Sarah Chen contact verification", result: "Email verified active, direct phone confirmed, last updated 2 weeks ago." } },
          ],
        },
        {
          name: "Marcus Johnson",
          title: "Director of Revenue Ops",
          email: "m.johnson@acmecorp.com",
          phone: "(415) 555-0198",
          department: "Revenue Operations",
          seniority: "Director",
          score: 85,
          source: { label: "ZoomInfo" },
          reason: "Manages tech stack including CRM and sales tools",
          bullets: [
            { text: "Revenue leadership and enterprise pipeline ownership", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Marcus Johnson Revenue Ops Acme Corp", result: "Marcus Johnson leads Revenue Operations at Acme, responsible for CRM administration, sales analytics, and GTM tooling." } },
            { text: "Explicitly mentions GTM systems and automation responsibilities", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Marcus Johnson GTM responsibilities", result: "Profile highlights experience with Salesforce, Outreach, and ZoomInfo administration across 3 previous roles." } },
          ],
        },
        {
          name: "Amanda Li",
          title: "SVP of Global Sales",
          email: "a.li@acmecorp.com",
          phone: "(415) 555-0377",
          department: "Sales",
          seniority: "SVP",
          score: 95,
          source: { label: "ZoomInfo" },
          reason: "Executive sponsor, owns global sales strategy",
          notInCrm: true,
          bullets: [
            { text: "Started her career as a BDR doing outbound prospecting", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Amanda Li SVP Global Sales Acme Corp", result: "Amanda Li joined Acme as SVP of Global Sales in 2023. Career history shows she started as a BDR at Oracle before rising through sales leadership." } },
          ],
        },
        {
          name: "Emily Rodriguez",
          title: "Head of Business Development",
          email: "e.rodriguez@acmecorp.com",
          phone: "(415) 555-0221",
          department: "Business Development",
          seniority: "Head",
          score: 78,
          source: { label: "ZoomInfo" },
          reason: "Leads BDR team of 15, expanding headcount",
          bullets: [
            { text: "Leads a BDR team of 15 with plans to expand to 25", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Emily Rodriguez Head of BD Acme Corp", result: "Emily Rodriguez manages the Business Development team at Acme. Currently 15 BDRs with 10 open headcount." } },
            { text: "Active on LinkedIn discussing outbound prospecting strategies", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Emily Rodriguez on LinkedIn", url: "linkedin.com/in/emily-rodriguez", snippet: "Recent posts about scaling outbound teams and evaluating prospecting tools for enterprise sales." } },
          ],
        },
        {
          name: "David Park",
          title: "CTO",
          email: "d.park@acmecorp.com",
          phone: "(415) 555-0305",
          department: "Engineering",
          seniority: "C-Suite",
          score: 65,
          source: { label: "ZoomInfo" },
          reason: "Technical evaluator, influences tool purchases",
          bullets: [
            { text: "Technical evaluator for all SaaS tool purchases", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "David Park CTO Acme Corp", result: "David Park is CTO at Acme Corporation. Responsible for technical evaluation and security review of vendor tools." } },
          ],
        },
        {
          name: "Karen Nguyen",
          title: "Sales Operations Manager",
          email: "k.nguyen@acmecorp.com",
          phone: "(415) 555-0418",
          department: "Sales Operations",
          seniority: "Manager",
          score: 72,
          source: { label: "ZoomInfo" },
          reason: "Manages sales tooling and processes",
          bullets: [
            { text: "Day-to-day owner of sales tools and CRM workflows", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Karen Nguyen Sales Ops Manager Acme", result: "Karen Nguyen manages sales operations tooling including Salesforce, Outreach, and data enrichment platforms." } },
          ],
        },
        {
          name: "Tom Bradley",
          title: "Director of Partnerships",
          email: "t.bradley@acmecorp.com",
          phone: "(415) 555-0263",
          department: "Partnerships",
          seniority: "Director",
          score: 68,
          source: { label: "ZoomInfo" },
          reason: "Oversees channel and tech partnerships",
          bullets: [
            { text: "Oversees channel and technology partnership programs", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Tom Bradley Partnerships Acme Corp", result: "Tom Bradley manages strategic partnerships at Acme, including technology vendor relationships and channel programs." } },
          ],
        },
        {
          name: "Rachel Kim",
          title: "BDR Team Lead",
          email: "r.kim@acmecorp.com",
          phone: "(415) 555-0349",
          department: "Business Development",
          seniority: "Team Lead",
          score: 58,
          source: { label: "ZoomInfo" },
          reason: "Manages 5 BDRs, uses prospecting tools daily",
          bullets: [
            { text: "Manages 5 BDRs and uses prospecting tools daily", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Rachel Kim BDR Team Lead Acme", result: "Rachel Kim leads a team of 5 BDRs focused on mid-market outbound prospecting." } },
          ],
        },
        {
          name: "James O'Brien",
          title: "Marketing Coordinator",
          email: "j.obrien@acmecorp.com",
          phone: "(415) 555-0512",
          department: "Marketing",
          seniority: "Individual Contributor",
          score: 35,
          source: { label: "ZoomInfo" },
          reason: "No buying authority, wrong department",
          bullets: [
            { text: "No buying authority, wrong department for this tool", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "James O'Brien Marketing Acme Corp", result: "James O'Brien is a Marketing Coordinator focused on event planning and content. No involvement in sales tooling." } },
          ],
        },
        {
          name: "Lisa Tran",
          title: "Customer Support Lead",
          email: "l.tran@acmecorp.com",
          phone: "(415) 555-0487",
          department: "Support",
          seniority: "Team Lead",
          score: 28,
          source: { label: "ZoomInfo" },
          reason: "Not in target department, no budget influence",
          bullets: [
            { text: "Not in target department, no budget influence", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Lisa Tran Support Acme Corp", result: "Lisa Tran leads customer support. No involvement in sales or revenue operations." } },
          ],
        },
      ],
    },

    "Globex International": {
      reasoning: "Searching for Globex International contacts in sales and marketing leadership who match the ICP profile for prospecting tool adoption.",
      prospects: [
        {
          name: "Jennifer Walsh",
          title: "SVP of Sales",
          email: "j.walsh@globex.com",
          phone: "(212) 555-0187",
          department: "Sales",
          seniority: "SVP",
          score: 88,
          source: { label: "ZoomInfo" },
          reason: "Oversees North America sales, 120+ reps",
          bullets: [
            { text: "Oversees North America sales org with 120+ reps", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Jennifer Walsh SVP Sales Globex", result: "Jennifer Walsh leads the North America sales organization at Globex International with over 120 direct and indirect reports." } },
            { text: "Previously led sales transformation at Cisco", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Jennifer Walsh career history", result: "Prior to Globex, Walsh was VP of Enterprise Sales at Cisco where she led a sales tooling modernization initiative." } },
          ],
        },
        {
          name: "Carlos Rivera",
          title: "Director of Sales Enablement",
          email: "c.rivera@globex.com",
          phone: "(212) 555-0244",
          department: "Sales Enablement",
          seniority: "Director",
          score: 82,
          source: { label: "ZoomInfo" },
          reason: "Responsible for sales tools and training",
          bullets: [
            { text: "Owns sales tool stack evaluation and procurement", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Carlos Rivera Sales Enablement Globex", result: "Carlos Rivera manages the sales enablement function including tool selection, onboarding, and training programs." } },
            { text: "Recently posted about evaluating prospecting platforms", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Carlos Rivera on LinkedIn", url: "linkedin.com/in/carlos-rivera", snippet: "Looking to consolidate our prospecting stack. If you're building in this space, I'd love to chat." } },
          ],
        },
        {
          name: "Aisha Patel",
          title: "VP of Marketing",
          email: "a.patel@globex.com",
          phone: "(212) 555-0331",
          department: "Marketing",
          seniority: "VP",
          score: 71,
          source: { label: "ZoomInfo" },
          reason: "Controls demand gen budget, ABM program owner",
          bullets: [
            { text: "Controls demand gen budget and runs ABM program", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Aisha Patel VP Marketing Globex", result: "Aisha Patel oversees marketing at Globex including a $5M demand generation budget and account-based marketing program." } },
          ],
        },
      ],
    },

    "Initech Solutions": {
      reasoning: "Looking for decision-makers at Initech Solutions in Sales Ops and Business Development who are evaluating prospecting solutions.",
      prospects: [
        {
          name: "Robert Kim",
          title: "VP of Sales Operations",
          email: "r.kim@initech.com",
          phone: "(512) 555-0156",
          department: "Sales Operations",
          seniority: "VP",
          score: 90,
          source: { label: "ZoomInfo" },
          reason: "Evaluating new prospecting tools, budget approved",
          bullets: [
            { text: "Actively evaluating prospecting tools with approved budget", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Robert Kim VP Sales Ops Initech", result: "Robert Kim leads Sales Operations at Initech. Recently posted a RFP for prospecting and data enrichment tools." } },
            { text: "Engaged with our content 3 times in the last month", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Robert Kim", fields: [{ label: "Lead Score", value: "85" }, { label: "Last Activity", value: "Mar 15, 2026" }, { label: "Content Downloads", value: "3" }] } },
          ],
        },
        {
          name: "Lisa Tanaka",
          title: "Director of BDR Team",
          email: "l.tanaka@initech.com",
          phone: "(512) 555-0219",
          department: "Business Development",
          seniority: "Director",
          score: 86,
          source: { label: "ZoomInfo" },
          reason: "Manages 22 BDRs, looking to improve productivity",
          bullets: [
            { text: "Manages 22 BDRs and looking to improve productivity", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Lisa Tanaka BDR Director Initech", result: "Lisa Tanaka directs the BDR team of 22 at Initech Solutions, focused on outbound pipeline generation." } },
            { text: "Previously used our competitor and switched away", source: { label: "Gong" }, evidence: { tool: "Analyze Past Conversations", conversations: [{ title: "Initech Sales Call", contact: "Lisa Tanaka", date: "Jan 22, 2026", quote: "\"...We used Outreach for 2 years but the data quality wasn't there. Open to exploring alternatives...\"" }] } },
          ],
        },
      ],
    },

    "Umbrella Corp": {
      reasoning: "Identifying key stakeholders at Umbrella Corp who are driving go-to-market transformation and need data enrichment tools.",
      prospects: [
        {
          name: "Michael Torres",
          title: "CRO",
          email: "m.torres@umbrellacorp.com",
          phone: "(305) 555-0173",
          department: "Revenue",
          seniority: "C-Suite",
          score: 94,
          source: { label: "ZoomInfo" },
          reason: "New CRO hire, transforming go-to-market",
          notInCrm: true,
          bullets: [
            { text: "New CRO hire transforming go-to-market strategy", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Michael Torres CRO Umbrella Corp", result: "Michael Torres joined Umbrella Corp as CRO 3 months ago from HubSpot where he led enterprise sales." } },
            { text: "Previously built outbound engine at HubSpot", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Michael Torres career history", result: "At HubSpot, Torres scaled the outbound BDR team from 15 to 80 reps over 2 years." } },
          ],
        },
        {
          name: "Hannah Lee",
          title: "Senior Director of Demand Gen",
          email: "h.lee@umbrellacorp.com",
          phone: "(305) 555-0289",
          department: "Marketing",
          seniority: "Senior Director",
          score: 80,
          source: { label: "ZoomInfo" },
          reason: "Running ABM pilot, needs better data enrichment",
          bullets: [
            { text: "Running ABM pilot and needs better data enrichment", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Hannah Lee Demand Gen Umbrella Corp", result: "Hannah Lee is piloting an ABM program at Umbrella Corp targeting enterprise accounts in healthcare and finance." } },
            { text: "Attended our webinar on prospecting best practices", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Hannah Lee", fields: [{ label: "Event", value: "Prospecting Best Practices Webinar" }, { label: "Date", value: "Feb 20, 2026" }, { label: "Status", value: "Attended" }] } },
          ],
        },
      ],
    },

    "Burlington Textiles Corp of America": {
      reasoning: "Searching for contacts at Burlington Textiles in sales and operations leadership who could benefit from prospecting automation in the apparel industry.",
      prospects: [
        {
          name: "Patricia Owens",
          title: "VP of Wholesale Sales",
          email: "p.owens@burlingtontextiles.com",
          phone: "(336) 222-7101",
          department: "Sales",
          seniority: "VP",
          score: 84,
          source: { label: "ZoomInfo" },
          reason: "Manages wholesale channel with 30+ reps",
          bullets: [
            { text: "Manages wholesale sales channel with 30+ reps nationally", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Patricia Owens VP Wholesale Sales Burlington Textiles", result: "Patricia Owens leads the wholesale sales division at Burlington Textiles, overseeing 32 sales representatives across 4 regions." } },
            { text: "Expanding into direct-to-business e-commerce", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Burlington Textiles B2B Launch", url: "burlingtontextiles.com/news", snippet: "Burlington Textiles announces new B2B e-commerce platform to complement wholesale channel." } },
          ],
        },
        {
          name: "Derek Simmons",
          title: "Director of Sales Operations",
          email: "d.simmons@burlingtontextiles.com",
          phone: "(336) 222-7205",
          department: "Sales Operations",
          seniority: "Director",
          score: 76,
          source: { label: "ZoomInfo" },
          reason: "Owns CRM and sales tooling for wholesale team",
          bullets: [
            { text: "Owns CRM administration and sales tooling decisions", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Derek Simmons Sales Ops Burlington Textiles", result: "Derek Simmons manages sales operations including Salesforce administration and sales enablement tools." } },
          ],
        },
      ],
    },

    "Dickenson plc": {
      reasoning: "Looking for decision-makers at Dickenson plc in consulting sales who might need prospecting tools for client acquisition.",
      prospects: [
        {
          name: "Fiona Gallagher",
          title: "Managing Director of Business Development",
          email: "f.gallagher@dickenson.com",
          phone: "(785) 241-6301",
          department: "Business Development",
          seniority: "Managing Director",
          score: 72,
          source: { label: "ZoomInfo" },
          reason: "Leads client acquisition but small team",
          bullets: [
            { text: "Leads client acquisition with a team of 6 consultants", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Fiona Gallagher BD Dickenson plc", result: "Fiona Gallagher manages business development at Dickenson plc with a small team focused on mid-market consulting engagements." } },
          ],
        },
      ],
    },

    "Edge Communications": {
      reasoning: "Searching for Edge Communications contacts in sales leadership who are scaling outbound efforts in the electronics space.",
      prospects: [
        {
          name: "Victor Reyes",
          title: "SVP of Enterprise Sales",
          email: "v.reyes@edgecomm.com",
          phone: "(512) 757-6100",
          department: "Sales",
          seniority: "SVP",
          score: 91,
          source: { label: "ZoomInfo" },
          reason: "Scaling enterprise sales team, evaluating tools",
          notInCrm: true,
          bullets: [
            { text: "Scaling enterprise sales from 40 to 80 reps this year", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Victor Reyes SVP Enterprise Sales Edge Communications", result: "Victor Reyes is leading a major expansion of Edge Communications' enterprise sales team, doubling headcount in 2026." } },
            { text: "Previously built outbound motion at Cisco Systems", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Victor Reyes career history", result: "Prior to Edge Communications, Reyes was VP of Sales at Cisco where he built the SMB outbound prospecting function." } },
            { text: "Spoke at SaaStr about modern prospecting strategies", source: { label: "Web" }, evidence: { tool: "Website Research", title: "SaaStr Annual 2025 Speakers", url: "saastr.com/annual/speakers", snippet: "Victor Reyes, SVP Enterprise Sales at Edge Communications, presenting 'Scaling Outbound in the AI Era'." } },
          ],
        },
        {
          name: "Naomi Sato",
          title: "Director of Revenue Operations",
          email: "n.sato@edgecomm.com",
          phone: "(512) 757-6215",
          department: "Revenue Operations",
          seniority: "Director",
          score: 83,
          source: { label: "ZoomInfo" },
          reason: "Responsible for sales tech stack consolidation",
          bullets: [
            { text: "Leading sales tech stack consolidation initiative", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Naomi Sato Rev Ops Edge Communications", result: "Naomi Sato is consolidating Edge Communications' sales tech stack from 12 tools to 5 core platforms." } },
            { text: "Responded to our outreach email last quarter", source: { label: "Email" }, evidence: { tool: "Analyze Past Conversations", conversations: [{ title: "Re: Sales Tool Consolidation", contact: "Naomi Sato", date: "Dec 3, 2025", quote: "\"...Interesting timing. We're actively reviewing our prospecting stack. Can you send more details?\"" }] } },
          ],
        },
      ],
    },

    "Express Logistics and Transport": {
      reasoning: "Searching for Express Logistics contacts in sales roles. Transportation companies typically have smaller sales teams.",
      prospects: [
        {
          name: "Greg Holloway",
          title: "VP of Business Development",
          email: "g.holloway@expresslogistics.com",
          phone: "(503) 421-7900",
          department: "Business Development",
          seniority: "VP",
          score: 62,
          source: { label: "ZoomInfo" },
          reason: "Small BD team, limited tool budget",
          bullets: [
            { text: "Manages a small BD team focused on regional accounts", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Greg Holloway VP BD Express Logistics", result: "Greg Holloway leads business development at Express Logistics with a team of 4 focused on Pacific Northwest logistics accounts." } },
          ],
        },
      ],
    },

    "GenePoint": {
      reasoning: "Searching for GenePoint contacts in commercial leadership. Biotech companies often have specialized sales teams.",
      prospects: [],
    },

    "Grand Hotels & Resorts Ltd": {
      reasoning: "Looking for Grand Hotels contacts in sales and revenue management who could use prospecting tools for group sales and corporate accounts.",
      prospects: [
        {
          name: "Christine Beaumont",
          title: "VP of Group Sales",
          email: "c.beaumont@grandhotels.com",
          phone: "(312) 596-1100",
          department: "Sales",
          seniority: "VP",
          score: 68,
          source: { label: "ZoomInfo" },
          reason: "Manages corporate and group bookings, relationship-driven sales",
          bullets: [
            { text: "Manages corporate and group booking sales for 12 properties", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Christine Beaumont VP Group Sales Grand Hotels", result: "Christine Beaumont oversees group sales across Grand Hotels' 12 luxury properties, managing corporate accounts and event bookings." } },
          ],
        },
        {
          name: "Raj Mehta",
          title: "Director of Revenue Management",
          email: "r.mehta@grandhotels.com",
          phone: "(312) 596-1245",
          department: "Revenue Management",
          seniority: "Director",
          score: 45,
          source: { label: "ZoomInfo" },
          reason: "Revenue management focus, not directly in sales tooling",
          bullets: [
            { text: "Focused on pricing and yield management, not outbound sales", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Raj Mehta Revenue Management Grand Hotels", result: "Raj Mehta leads revenue management and pricing strategy. His team focuses on occupancy optimization rather than outbound prospecting." } },
          ],
        },
      ],
    },

    "Greentech Renewables": {
      reasoning: "Searching for Greentech Renewables contacts in sales and business development who are building pipeline in the renewable energy sector.",
      prospects: [
        {
          name: "Alicia Moreno",
          title: "VP of Commercial Sales",
          email: "a.moreno@greentechrenewables.com",
          phone: "(720) 555-0201",
          department: "Sales",
          seniority: "VP",
          score: 86,
          source: { label: "ZoomInfo" },
          reason: "Building commercial sales team for solar and wind projects",
          bullets: [
            { text: "Building commercial sales team from 10 to 25 reps", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Alicia Moreno VP Commercial Sales Greentech Renewables", result: "Alicia Moreno is scaling the commercial sales organization at Greentech Renewables to support expansion into new markets." } },
            { text: "Attended our booth at Dreamforce 2025", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Alicia Moreno", fields: [{ label: "Event", value: "Dreamforce 2025" }, { label: "Booth Visit", value: "Yes" }, { label: "Demo Requested", value: "Yes" }] } },
          ],
        },
        {
          name: "Ethan Brooks",
          title: "BDR Manager",
          email: "e.brooks@greentechrenewables.com",
          phone: "(720) 555-0218",
          department: "Business Development",
          seniority: "Manager",
          score: 71,
          source: { label: "ZoomInfo" },
          reason: "Manages BDR team but limited buying authority",
          bullets: [
            { text: "Manages 8 BDRs focused on commercial solar prospects", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Ethan Brooks BDR Manager Greentech Renewables", result: "Ethan Brooks manages the BDR team at Greentech Renewables, focused on outbound prospecting for commercial solar installations." } },
          ],
        },
      ],
    },

    "Harbour Capital Partners": {
      reasoning: "Searching for Harbour Capital contacts in business development. Financial services firms typically have relationship-driven sales.",
      prospects: [
        {
          name: "William Ashford",
          title: "Managing Director of Client Relations",
          email: "w.ashford@harbourcapital.com",
          phone: "(617) 555-0200",
          department: "Client Relations",
          seniority: "Managing Director",
          score: 55,
          source: { label: "ZoomInfo" },
          reason: "Relationship-driven role, limited outbound prospecting needs",
          bullets: [
            { text: "Manages high-touch client relationships for institutional investors", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "William Ashford MD Client Relations Harbour Capital", result: "William Ashford oversees client relationships for Harbour Capital's institutional investor base. Sales process is referral-driven." } },
          ],
        },
      ],
    },

    "Horizon Media Group": {
      reasoning: "Looking for Horizon Media contacts in ad sales and business development who could benefit from prospecting tools.",
      prospects: [
        {
          name: "Danielle Foster",
          title: "SVP of Ad Sales",
          email: "d.foster@horizonmedia.com",
          phone: "(212) 555-0200",
          department: "Ad Sales",
          seniority: "SVP",
          score: 82,
          source: { label: "ZoomInfo" },
          reason: "Large ad sales team, actively modernizing outreach",
          bullets: [
            { text: "Leads ad sales team of 50+ selling across digital and broadcast", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Danielle Foster SVP Ad Sales Horizon Media", result: "Danielle Foster leads Horizon Media's ad sales organization with 55 reps selling across digital, broadcast, and streaming platforms." } },
            { text: "Investing in sales automation to reduce manual prospecting", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Horizon Media Modernizes Sales", url: "adweek.com/horizon-media-sales-tech", snippet: "Horizon Media Group investing in AI-powered sales tools to streamline advertiser outreach and reduce manual prospecting." } },
          ],
        },
      ],
    },

    "Innovatech Solutions": {
      reasoning: "Searching for Innovatech Solutions contacts in sales and GTM roles. Technology companies are strong ICP fits.",
      prospects: [
        {
          name: "Priya Sharma",
          title: "CRO",
          email: "p.sharma@innovatech.com",
          phone: "(206) 555-0200",
          department: "Revenue",
          seniority: "C-Suite",
          score: 93,
          source: { label: "ZoomInfo" },
          reason: "New CRO building GTM from scratch",
          notInCrm: true,
          bullets: [
            { text: "Hired 4 months ago to build GTM motion from scratch", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Priya Sharma CRO Innovatech Solutions", result: "Priya Sharma joined Innovatech Solutions as CRO in Nov 2025 to build the company's first enterprise go-to-market function." } },
            { text: "Previously VP of Sales at Datadog where she scaled outbound", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Priya Sharma career history", result: "At Datadog, Sharma built the outbound sales motion from 0 to $40M ARR over 3 years." } },
            { text: "Connected with our AE on LinkedIn last week", source: { label: "Web" }, evidence: { tool: "Website Research", title: "LinkedIn Connection", url: "linkedin.com/in/priya-sharma", snippet: "Priya Sharma accepted connection request from our AE and liked a post about AI-powered prospecting." } },
          ],
        },
        {
          name: "Jason Whitfield",
          title: "Head of Sales Development",
          email: "j.whitfield@innovatech.com",
          phone: "(206) 555-0234",
          department: "Sales Development",
          seniority: "Head",
          score: 87,
          source: { label: "ZoomInfo" },
          reason: "Building SDR team, evaluating prospecting tools",
          bullets: [
            { text: "Building SDR team from 0 to 15 in Q1-Q2 2026", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Jason Whitfield Head of Sales Dev Innovatech", result: "Jason Whitfield is hiring aggressively to build Innovatech's first SDR team, with 8 of 15 positions already filled." } },
            { text: "Downloaded our prospecting playbook last month", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Jason Whitfield", fields: [{ label: "Content", value: "Enterprise Prospecting Playbook" }, { label: "Date", value: "Feb 28, 2026" }, { label: "Lead Score", value: "72" }] } },
          ],
        },
      ],
    },

    "Jackson & Associates": {
      reasoning: "Searching for Jackson & Associates contacts in consulting sales. Consulting firms often rely on partner-led sales.",
      prospects: [],
    },

    "Keystone Manufacturing": {
      reasoning: "Looking for Keystone Manufacturing contacts in sales leadership. Manufacturing companies may have traditional sales processes.",
      prospects: [
        {
          name: "Brian Kowalski",
          title: "VP of Sales",
          email: "b.kowalski@keystonemfg.com",
          phone: "(412) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 58,
          source: { label: "ZoomInfo" },
          reason: "Traditional sales process, slow to adopt new tools",
          bullets: [
            { text: "Manages field sales team selling industrial equipment", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Brian Kowalski VP Sales Keystone Manufacturing", result: "Brian Kowalski leads a field sales team of 20 selling industrial manufacturing equipment through trade shows and referrals." } },
          ],
        },
      ],
    },

    "Lakewood Health Systems": {
      reasoning: "Searching for Lakewood Health contacts in business development. Healthcare organizations have complex sales cycles.",
      prospects: [
        {
          name: "Dr. Sandra Liu",
          title: "VP of Strategic Partnerships",
          email: "s.liu@lakewoodhealth.com",
          phone: "(612) 555-0200",
          department: "Partnerships",
          seniority: "VP",
          score: 48,
          source: { label: "ZoomInfo" },
          reason: "Partnership-focused, not traditional outbound sales",
          bullets: [
            { text: "Manages health system partnerships, not outbound sales", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Sandra Liu VP Partnerships Lakewood Health", result: "Dr. Sandra Liu manages strategic partnerships with health systems and payers. Sales process is RFP-driven, not outbound." } },
          ],
        },
      ],
    },

    "Meridian Financial Group": {
      reasoning: "Looking for Meridian Financial contacts in wealth management sales and business development.",
      prospects: [
        {
          name: "Thomas Grant",
          title: "SVP of Wealth Management Sales",
          email: "t.grant@meridianfg.com",
          phone: "(704) 555-0200",
          department: "Sales",
          seniority: "SVP",
          score: 74,
          source: { label: "ZoomInfo" },
          reason: "Large advisor network but relationship-driven model",
          bullets: [
            { text: "Oversees 200+ financial advisors across Southeast region", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Thomas Grant SVP Wealth Management Meridian Financial", result: "Thomas Grant manages a network of 215 financial advisors. Client acquisition is primarily referral-based." } },
            { text: "Exploring digital prospecting for younger demographic", source: { label: "Gong" }, evidence: { tool: "Analyze Past Conversations", conversations: [{ title: "Meridian Financial Discovery Call", contact: "Thomas Grant", date: "Oct 18, 2025", quote: "\"...We need to reach younger HNW prospects who don't respond to traditional outreach methods...\"" }] } },
          ],
        },
      ],
    },

    "NovaTech Industries": {
      reasoning: "Searching for NovaTech Industries contacts in sales and marketing. Technology companies in the Research Triangle are often strong fits.",
      prospects: [
        {
          name: "Rebecca Thornton",
          title: "Director of Inside Sales",
          email: "r.thornton@novatech.com",
          phone: "(919) 555-0200",
          department: "Sales",
          seniority: "Director",
          score: 79,
          source: { label: "ZoomInfo" },
          reason: "Manages inside sales team, evaluating outbound tools",
          bullets: [
            { text: "Manages inside sales team of 18 reps doing outbound", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Rebecca Thornton Inside Sales NovaTech", result: "Rebecca Thornton leads the inside sales team at NovaTech Industries, responsible for outbound pipeline generation." } },
            { text: "Current ZoomInfo customer looking to add prospecting layer", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "NovaTech Industries tech stack", result: "NovaTech is a current ZoomInfo customer using data enrichment. Looking to add automated prospecting capabilities." } },
          ],
        },
      ],
    },

    "Oceanic Airlines": {
      reasoning: "Searching for Oceanic Airlines contacts in corporate sales. Airlines have specialized B2B sales for corporate travel programs.",
      prospects: [
        {
          name: "Margaret Chen",
          title: "VP of Corporate Sales",
          email: "m.chen@oceanicairlines.com",
          phone: "(310) 555-0200",
          department: "Corporate Sales",
          seniority: "VP",
          score: 43,
          source: { label: "ZoomInfo" },
          reason: "Corporate travel sales, very different from tech sales motion",
          bullets: [
            { text: "Manages corporate travel program sales through RFP process", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Margaret Chen VP Corporate Sales Oceanic Airlines", result: "Margaret Chen oversees corporate travel account sales at Oceanic Airlines. Sales are primarily through travel management companies and RFPs." } },
          ],
        },
      ],
    },

    "Pacific Rim Trading Co.": {
      reasoning: "Looking for Pacific Rim Trading contacts in retail sales and e-commerce who might benefit from prospecting tools.",
      prospects: [],
    },

    "Pinnacle Construction Inc.": {
      reasoning: "Searching for Pinnacle Construction contacts in business development. Construction companies rely heavily on bidding and referrals.",
      prospects: [
        {
          name: "Mike Daniels",
          title: "VP of Business Development",
          email: "m.daniels@pinnacleconstruction.com",
          phone: "(480) 555-0200",
          department: "Business Development",
          seniority: "VP",
          score: 52,
          source: { label: "ZoomInfo" },
          reason: "BD role but construction sales are bid-driven",
          bullets: [
            { text: "Manages project bidding and developer relationships", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Mike Daniels VP BD Pinnacle Construction", result: "Mike Daniels leads business development at Pinnacle Construction, primarily through project bidding and developer relationships." } },
          ],
        },
      ],
    },

    "Pyramid Construction Inc.": {
      reasoning: "Searching for Pyramid Construction contacts. Similar to other construction firms, sales are primarily bid-driven.",
      prospects: [],
    },

    "Quantum Analytics": {
      reasoning: "Searching for Quantum Analytics contacts in sales and GTM. Analytics companies often have sophisticated sales operations.",
      prospects: [
        {
          name: "Samantha Reeves",
          title: "VP of Sales",
          email: "s.reeves@quantumanalytics.com",
          phone: "(408) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 89,
          source: { label: "ZoomInfo" },
          reason: "Scaling sales team, strong tech buyer",
          bullets: [
            { text: "Scaling sales org from 25 to 60 reps in 2026", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Samantha Reeves VP Sales Quantum Analytics", result: "Samantha Reeves is leading aggressive sales hiring at Quantum Analytics, more than doubling the team this year." } },
            { text: "Currently using a competitor tool and unhappy with data quality", source: { label: "Gong" }, evidence: { tool: "Analyze Past Conversations", conversations: [{ title: "Quantum Analytics Intro Call", contact: "Samantha Reeves", date: "Jan 15, 2026", quote: "\"...Our current prospecting tool has terrible data quality. We're wasting hours on bad phone numbers and outdated emails...\"" }] } },
          ],
        },
        {
          name: "Kevin Tran",
          title: "Sales Operations Lead",
          email: "k.tran@quantumanalytics.com",
          phone: "(408) 555-0234",
          department: "Sales Operations",
          seniority: "Lead",
          score: 73,
          source: { label: "ZoomInfo" },
          reason: "Manages sales tools but limited budget authority",
          bullets: [
            { text: "Day-to-day admin for Salesforce and prospecting tools", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Kevin Tran Sales Ops Quantum Analytics", result: "Kevin Tran manages the sales tech stack at Quantum Analytics including Salesforce, Outreach, and data enrichment tools." } },
          ],
        },
      ],
    },

    "Redwood Materials": {
      reasoning: "Searching for Redwood Materials contacts in sales. Manufacturing prospects may have limited outbound sales needs.",
      prospects: [
        {
          name: "Laura Fitzgerald",
          title: "Director of Commercial Sales",
          email: "l.fitzgerald@redwoodmaterials.com",
          phone: "(775) 555-0200",
          department: "Sales",
          seniority: "Director",
          score: 66,
          source: { label: "ZoomInfo" },
          reason: "Growing commercial team but niche market",
          bullets: [
            { text: "Building commercial sales function for recycled battery materials", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Laura Fitzgerald Commercial Sales Redwood Materials", result: "Laura Fitzgerald is building the commercial sales team at Redwood Materials to sell recycled battery materials to EV manufacturers." } },
          ],
        },
      ],
    },

    "Salesforce.com, Inc.": {
      reasoning: "Searching for Salesforce contacts. As a large enterprise, they have extensive sales operations.",
      prospects: [
        {
          name: "Jordan Blake",
          title: "VP of Commercial Sales",
          email: "j.blake@salesforce.com",
          phone: "(415) 901-7100",
          department: "Sales",
          seniority: "VP",
          score: 88,
          source: { label: "ZoomInfo" },
          reason: "Large commercial sales org, always evaluating tools",
          bullets: [
            { text: "Manages 150+ AEs in commercial segment", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Jordan Blake VP Commercial Sales Salesforce", result: "Jordan Blake oversees the commercial sales segment at Salesforce with over 150 account executives." } },
            { text: "Piloting AI prospecting tools in Q1 2026", source: { label: "Gong" }, evidence: { tool: "Analyze Past Conversations", conversations: [{ title: "Salesforce Partnership Discussion", contact: "Jordan Blake", date: "Feb 5, 2026", quote: "\"...We're running pilots with 3 AI prospecting vendors this quarter. Happy to include you if the timing works...\"" }] } },
          ],
        },
        {
          name: "Nina Patel",
          title: "Senior Director of Sales Strategy",
          email: "n.patel@salesforce.com",
          phone: "(415) 901-7250",
          department: "Sales Strategy",
          seniority: "Senior Director",
          score: 81,
          source: { label: "ZoomInfo" },
          reason: "Defines sales methodology and tooling strategy",
          bullets: [
            { text: "Defines sales methodology and tooling strategy for all segments", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Nina Patel Sales Strategy Salesforce", result: "Nina Patel leads sales strategy at Salesforce, defining methodology, tooling standards, and productivity metrics across all sales segments." } },
          ],
        },
      ],
    },

    "sForce": {
      reasoning: "Searching for sForce contacts in sales and partnerships. As a technology partner, they may have different prospecting needs.",
      prospects: [],
    },

    "Sierra Wireless Networks": {
      reasoning: "Searching for Sierra Wireless contacts in sales leadership. Telecom companies often have large field sales teams.",
      prospects: [
        {
          name: "Alan Cooper",
          title: "VP of Enterprise Sales",
          email: "a.cooper@sierrawireless.com",
          phone: "(801) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 85,
          source: { label: "ZoomInfo" },
          reason: "Large enterprise sales team, evaluating prospecting tools",
          bullets: [
            { text: "Manages enterprise sales team of 45 across western US", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Alan Cooper VP Enterprise Sales Sierra Wireless", result: "Alan Cooper leads the enterprise sales division at Sierra Wireless Networks with 45 reps covering the western United States." } },
            { text: "Budget approved for new prospecting platform in 2026", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Alan Cooper", fields: [{ label: "Opportunity", value: "Sierra Wireless - Prospecting Platform" }, { label: "Stage", value: "Evaluation" }, { label: "Budget", value: "$120K" }] } },
          ],
        },
      ],
    },

    "Summit Healthcare Partners": {
      reasoning: "Searching for Summit Healthcare contacts in business development. Healthcare partnerships are typically relationship-driven.",
      prospects: [
        {
          name: "Catherine Wells",
          title: "Director of Provider Relations",
          email: "c.wells@summithealthcare.com",
          phone: "(615) 555-0200",
          department: "Provider Relations",
          seniority: "Director",
          score: 39,
          source: { label: "ZoomInfo" },
          reason: "Provider relations role, not traditional sales",
          bullets: [
            { text: "Manages provider network relationships, not outbound sales", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Catherine Wells Provider Relations Summit Healthcare", result: "Catherine Wells manages relationships with healthcare providers in Summit's network. Role is relationship management, not prospecting." } },
          ],
        },
      ],
    },

    "Terracotta Designs": {
      reasoning: "Searching for Terracotta Designs contacts in retail sales. Small retail companies may have limited prospecting needs.",
      prospects: [],
    },

    "TrueNorth Logistics": {
      reasoning: "Searching for TrueNorth Logistics contacts in sales and business development. Logistics companies are expanding digital sales.",
      prospects: [
        {
          name: "Ryan Mackenzie",
          title: "Director of Sales",
          email: "r.mackenzie@truenorthlogistics.com",
          phone: "(907) 555-0200",
          department: "Sales",
          seniority: "Director",
          score: 70,
          source: { label: "ZoomInfo" },
          reason: "Growing sales team but remote/regional focus",
          bullets: [
            { text: "Growing sales team focused on Alaska and Pacific Northwest logistics", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Ryan Mackenzie Director Sales TrueNorth Logistics", result: "Ryan Mackenzie leads sales at TrueNorth Logistics, focused on cold-chain and remote logistics in Alaska and the Pacific Northwest." } },
          ],
        },
      ],
    },

    "United Oil & Gas Corp.": {
      reasoning: "Searching for United Oil & Gas contacts in enterprise sales and business development.",
      prospects: [
        {
          name: "Richard Harmon",
          title: "VP of Enterprise Sales",
          email: "r.harmon@unitedoilgas.com",
          phone: "(212) 842-5600",
          department: "Sales",
          seniority: "VP",
          score: 77,
          source: { label: "ZoomInfo" },
          reason: "Enterprise sales leader but energy sector has long cycles",
          bullets: [
            { text: "Manages enterprise accounts for oil and gas technology solutions", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Richard Harmon VP Enterprise Sales United Oil Gas", result: "Richard Harmon leads enterprise sales at United Oil & Gas Corp., selling technology solutions to major energy companies." } },
            { text: "Mentioned interest in data-driven prospecting at industry event", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Energy Tech Summit 2025", url: "energytechsummit.com/speakers", snippet: "Richard Harmon discussed the need for better data-driven prospecting in energy sector sales." } },
          ],
        },
      ],
    },

    "United Oil & Gas, Singapore": {
      reasoning: "Searching for United Oil & Gas Singapore contacts. APAC operations may have separate sales leadership.",
      prospects: [
        {
          name: "Wei Lin Tan",
          title: "Regional Sales Director",
          email: "w.tan@unitedoilgas.sg",
          phone: "+65 6555 0200",
          department: "Sales",
          seniority: "Director",
          score: 64,
          source: { label: "ZoomInfo" },
          reason: "Regional role with limited autonomy on tool purchases",
          bullets: [
            { text: "Manages APAC sales team of 12 for energy solutions", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Wei Lin Tan Regional Sales United Oil Gas Singapore", result: "Wei Lin Tan leads the APAC sales team at United Oil & Gas Singapore, covering Southeast Asia and Australia." } },
          ],
        },
      ],
    },

    "United Oil & Gas, UK": {
      reasoning: "Searching for United Oil & Gas UK contacts in EMEA sales leadership.",
      prospects: [],
    },

    "University of Arizona": {
      reasoning: "Searching for University of Arizona contacts in enrollment and advancement. Higher education has unique outreach needs.",
      prospects: [
        {
          name: "Dr. James Whitaker",
          title: "VP of Enrollment Management",
          email: "j.whitaker@arizona.edu",
          phone: "(520) 773-9100",
          department: "Enrollment",
          seniority: "VP",
          score: 35,
          source: { label: "ZoomInfo" },
          reason: "Higher ed enrollment, very different from B2B sales",
          bullets: [
            { text: "Manages student recruitment, not B2B sales motion", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "James Whitaker VP Enrollment University of Arizona", result: "Dr. Whitaker oversees student enrollment and recruitment. Outreach is to prospective students, not B2B prospects." } },
          ],
        },
      ],
    },

    "Vanguard Real Estate": {
      reasoning: "Searching for Vanguard Real Estate contacts in commercial sales and leasing.",
      prospects: [
        {
          name: "Sofia Martinez",
          title: "Director of Commercial Leasing",
          email: "s.martinez@vanguardre.com",
          phone: "(305) 555-0200",
          department: "Commercial Leasing",
          seniority: "Director",
          score: 47,
          source: { label: "ZoomInfo" },
          reason: "Commercial leasing, relationship-driven not outbound",
          bullets: [
            { text: "Manages commercial leasing through broker relationships", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Sofia Martinez Commercial Leasing Vanguard Real Estate", result: "Sofia Martinez leads commercial leasing at Vanguard Real Estate, working primarily through broker networks and referrals." } },
          ],
        },
      ],
    },

    "Vertex Pharmaceuticals": {
      reasoning: "Searching for Vertex Pharmaceuticals contacts in commercial and medical sales leadership.",
      prospects: [
        {
          name: "Dr. Andrew Kim",
          title: "VP of Commercial Operations",
          email: "a.kim@vertexpharma.com",
          phone: "(617) 555-0200",
          department: "Commercial",
          seniority: "VP",
          score: 61,
          source: { label: "ZoomInfo" },
          reason: "Pharma commercial ops, regulated sales environment",
          bullets: [
            { text: "Manages commercial operations for specialty pharma sales", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Andrew Kim VP Commercial Ops Vertex Pharmaceuticals", result: "Dr. Andrew Kim oversees commercial operations at Vertex Pharmaceuticals, managing field sales teams for specialty medications." } },
          ],
        },
        {
          name: "Rachel Nguyen",
          title: "Director of Sales Analytics",
          email: "r.nguyen@vertexpharma.com",
          phone: "(617) 555-0234",
          department: "Sales Analytics",
          seniority: "Director",
          score: 53,
          source: { label: "ZoomInfo" },
          reason: "Analytics role, not directly involved in prospecting",
          bullets: [
            { text: "Focused on sales analytics and territory optimization", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Rachel Nguyen Sales Analytics Vertex", result: "Rachel Nguyen leads sales analytics at Vertex, focused on territory planning and rep productivity metrics." } },
          ],
        },
      ],
    },

    "Wavefront Technologies": {
      reasoning: "Searching for Wavefront Technologies contacts in sales and GTM. Austin tech companies are often strong ICP fits.",
      prospects: [
        {
          name: "Chris Donovan",
          title: "VP of Sales",
          email: "c.donovan@wavefronttech.com",
          phone: "(512) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 87,
          source: { label: "ZoomInfo" },
          reason: "Growing sales org, strong tech buyer profile",
          bullets: [
            { text: "Growing sales team from 20 to 40 reps in 2026", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Chris Donovan VP Sales Wavefront Technologies", result: "Chris Donovan is doubling the sales team at Wavefront Technologies, hiring aggressively in Austin and remote." } },
            { text: "Previously VP of Sales at Gong where he used AI prospecting", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Chris Donovan career history", result: "Before Wavefront, Donovan was VP of Sales at Gong where he championed AI-powered prospecting and conversation intelligence." } },
          ],
        },
        {
          name: "Megan Torres",
          title: "Head of SDR Team",
          email: "m.torres@wavefronttech.com",
          phone: "(512) 555-0234",
          department: "Sales Development",
          seniority: "Head",
          score: 82,
          source: { label: "ZoomInfo" },
          reason: "Runs SDR team, direct user of prospecting tools",
          notInCrm: true,
          bullets: [
            { text: "Runs SDR team of 12 and is a daily user of prospecting tools", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Megan Torres Head SDR Wavefront Technologies", result: "Megan Torres manages the SDR team at Wavefront Technologies, responsible for outbound pipeline generation and tool adoption." } },
          ],
        },
      ],
    },

    "Westfield Insurance": {
      reasoning: "Searching for Westfield Insurance contacts in sales and distribution. Insurance companies have agent-based distribution models.",
      prospects: [
        {
          name: "Paul Henderson",
          title: "VP of Agency Distribution",
          email: "p.henderson@westfieldins.com",
          phone: "(614) 555-0200",
          department: "Distribution",
          seniority: "VP",
          score: 56,
          source: { label: "ZoomInfo" },
          reason: "Agent distribution model, different from direct sales",
          bullets: [
            { text: "Manages independent agent network of 1,000+ agencies", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Paul Henderson VP Distribution Westfield Insurance", result: "Paul Henderson oversees Westfield's independent agent distribution network spanning over 1,000 agencies across the Midwest." } },
          ],
        },
      ],
    },

    "Xenon Biotech": {
      reasoning: "Searching for Xenon Biotech contacts in commercial and business development roles.",
      prospects: [
        {
          name: "Dr. Elena Vasquez",
          title: "VP of Business Development",
          email: "e.vasquez@xenonbiotech.com",
          phone: "(858) 555-0200",
          department: "Business Development",
          seniority: "VP",
          score: 69,
          source: { label: "ZoomInfo" },
          reason: "BD focused on pharma partnerships, not outbound sales",
          bullets: [
            { text: "Leads partnership development with major pharma companies", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Elena Vasquez VP BD Xenon Biotech", result: "Dr. Elena Vasquez leads business development at Xenon Biotech, focused on licensing deals and co-development partnerships with large pharma." } },
          ],
        },
      ],
    },

    "Yellowstone Capital": {
      reasoning: "Searching for Yellowstone Capital contacts in financial sales and advisory.",
      prospects: [],
    },

    "Zenith Electronics": {
      reasoning: "Searching for Zenith Electronics contacts in sales leadership. Electronics manufacturers may be modernizing their sales approach.",
      prospects: [
        {
          name: "Derek Washington",
          title: "VP of Channel Sales",
          email: "d.washington@zenithelectronics.com",
          phone: "(313) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 75,
          source: { label: "ZoomInfo" },
          reason: "Channel sales leader, exploring direct sales motion",
          bullets: [
            { text: "Exploring adding direct sales motion alongside channel partners", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Derek Washington VP Channel Sales Zenith Electronics", result: "Derek Washington manages channel sales at Zenith Electronics and is piloting a direct enterprise sales team for the first time." } },
            { text: "Attended our webinar on channel-to-direct sales transitions", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Derek Washington", fields: [{ label: "Event", value: "Channel-to-Direct Sales Webinar" }, { label: "Date", value: "Mar 10, 2026" }, { label: "Status", value: "Attended" }] } },
          ],
        },
      ],
    },

    "Atlas Supply Chain": {
      reasoning: "Searching for Atlas Supply Chain contacts in sales and business development. Supply chain companies are investing in digital sales.",
      prospects: [
        {
          name: "Maria Santos",
          title: "Director of Enterprise Sales",
          email: "m.santos@atlassupplychain.com",
          phone: "(901) 555-0200",
          department: "Sales",
          seniority: "Director",
          score: 80,
          source: { label: "ZoomInfo" },
          reason: "Growing enterprise sales function",
          bullets: [
            { text: "Building enterprise sales team for supply chain SaaS platform", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Maria Santos Enterprise Sales Atlas Supply Chain", result: "Maria Santos is building the enterprise sales function at Atlas Supply Chain, selling their logistics optimization platform." } },
            { text: "Requested a demo through our website last week", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Maria Santos", fields: [{ label: "Source", value: "Inbound Demo Request" }, { label: "Date", value: "Mar 20, 2026" }, { label: "Status", value: "New" }] } },
          ],
        },
      ],
    },

    "Beacon Analytics": {
      reasoning: "Searching for Beacon Analytics contacts in sales and GTM. Analytics companies often have data-savvy sales teams.",
      prospects: [
        {
          name: "Tyler Morrison",
          title: "Head of Sales",
          email: "t.morrison@beaconanalytics.com",
          phone: "(402) 555-0200",
          department: "Sales",
          seniority: "Head",
          score: 78,
          source: { label: "ZoomInfo" },
          reason: "Growing sales team, data-driven approach",
          bullets: [
            { text: "Growing sales team from 8 to 20 reps this year", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Tyler Morrison Head of Sales Beacon Analytics", result: "Tyler Morrison is scaling the sales team at Beacon Analytics, focused on mid-market data analytics buyers." } },
          ],
        },
      ],
    },

    "Cascade Water Systems": {
      reasoning: "Searching for Cascade Water Systems contacts in sales. Utilities companies typically have account management focused sales.",
      prospects: [],
    },

    "DeltaWing Aerospace": {
      reasoning: "Searching for DeltaWing Aerospace contacts in business development. Aerospace companies have government and defense sales cycles.",
      prospects: [
        {
          name: "Colonel (Ret.) James Foster",
          title: "VP of Business Development",
          email: "j.foster@deltawing.com",
          phone: "(256) 555-0200",
          department: "Business Development",
          seniority: "VP",
          score: 42,
          source: { label: "ZoomInfo" },
          reason: "Government/defense BD, very different from commercial sales",
          bullets: [
            { text: "Manages government and defense contract business development", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "James Foster VP BD DeltaWing Aerospace", result: "James Foster leads business development at DeltaWing Aerospace, focused on DoD contracts and government procurement." } },
          ],
        },
      ],
    },

    "Ember Hospitality Group": {
      reasoning: "Searching for Ember Hospitality contacts in sales and events. Hospitality companies have group sales and event-driven revenue.",
      prospects: [
        {
          name: "Jessica Huang",
          title: "VP of Sales & Events",
          email: "j.huang@emberhospitality.com",
          phone: "(702) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 63,
          source: { label: "ZoomInfo" },
          reason: "Event and group sales, partially relevant",
          bullets: [
            { text: "Manages group sales and events across 8 Las Vegas properties", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Jessica Huang VP Sales Ember Hospitality", result: "Jessica Huang oversees sales and events at Ember Hospitality Group's 8 Las Vegas properties, managing corporate events and group bookings." } },
          ],
        },
      ],
    },

    "Frontier AgriTech": {
      reasoning: "Searching for Frontier AgriTech contacts in sales. Agricultural technology companies are growing their commercial teams.",
      prospects: [
        {
          name: "Jake Andersen",
          title: "Director of Commercial Sales",
          email: "j.andersen@frontieragritech.com",
          phone: "(515) 555-0200",
          department: "Sales",
          seniority: "Director",
          score: 72,
          source: { label: "ZoomInfo" },
          reason: "Growing commercial team for precision ag platform",
          bullets: [
            { text: "Building commercial sales team for precision agriculture platform", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Jake Andersen Commercial Sales Frontier AgriTech", result: "Jake Andersen leads commercial sales at Frontier AgriTech, selling precision agriculture solutions to large farming operations." } },
            { text: "Hiring 5 new AEs focused on Midwest territory", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Frontier AgriTech Careers", url: "frontieragritech.com/careers", snippet: "5 open Account Executive positions for Midwest territory, selling precision agriculture solutions to enterprise farms." } },
          ],
        },
      ],
    },

    "Global Media Ventures": {
      reasoning: "Searching for Global Media Ventures contacts in ad sales and business development.",
      prospects: [
        {
          name: "Olivia Park",
          title: "SVP of Revenue",
          email: "o.park@globalmediaventures.com",
          phone: "(213) 555-0200",
          department: "Revenue",
          seniority: "SVP",
          score: 83,
          source: { label: "ZoomInfo" },
          reason: "Revenue leader with large sales org",
          bullets: [
            { text: "Oversees $200M revenue org across digital and traditional media", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Olivia Park SVP Revenue Global Media Ventures", result: "Olivia Park leads the revenue organization at Global Media Ventures, managing $200M across digital advertising, content licensing, and streaming." } },
            { text: "Modernizing sales tech stack after recent acquisition", source: { label: "Web" }, evidence: { tool: "Website Research", title: "Global Media Ventures Acquires StreamCo", url: "variety.com/global-media-streamco", snippet: "Global Media Ventures completes acquisition of StreamCo, plans to consolidate sales operations and technology platforms." } },
          ],
        },
        {
          name: "Derek Simmons",
          title: "Director of Sales Operations",
          email: "d.simmons@globalmediaventures.com",
          phone: "(213) 555-0234",
          department: "Sales Operations",
          seniority: "Director",
          score: 76,
          source: { label: "ZoomInfo" },
          reason: "Owns sales tech stack, evaluating new tools",
          bullets: [
            { text: "Leading sales tech stack evaluation post-acquisition", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Derek Simmons Sales Ops Global Media Ventures", result: "Derek Simmons is leading the sales technology consolidation effort following the StreamCo acquisition." } },
          ],
        },
      ],
    },

    "Highland Consulting": {
      reasoning: "Searching for Highland Consulting contacts in business development. Consulting firms often have partner-led sales.",
      prospects: [
        {
          name: "Elizabeth Warren",
          title: "Partner, Business Development",
          email: "e.warren@highlandconsulting.com",
          phone: "(804) 555-0200",
          department: "Business Development",
          seniority: "Partner",
          score: 46,
          source: { label: "ZoomInfo" },
          reason: "Partner-led sales model, limited outbound prospecting",
          bullets: [
            { text: "Leads client acquisition through referral network and events", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Elizabeth Warren Partner BD Highland Consulting", result: "Elizabeth Warren manages business development at Highland Consulting through partner referrals, industry events, and thought leadership." } },
          ],
        },
      ],
    },

    "Ironbridge Capital": {
      reasoning: "Searching for Ironbridge Capital contacts in deal sourcing and business development.",
      prospects: [
        {
          name: "Nathan Cross",
          title: "VP of Deal Sourcing",
          email: "n.cross@ironbridgecapital.com",
          phone: "(860) 555-0200",
          department: "Deal Sourcing",
          seniority: "VP",
          score: 71,
          source: { label: "ZoomInfo" },
          reason: "Deal sourcing role could benefit from prospecting tools",
          bullets: [
            { text: "Manages deal sourcing pipeline for PE firm", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Nathan Cross VP Deal Sourcing Ironbridge Capital", result: "Nathan Cross leads deal sourcing at Ironbridge Capital, identifying and evaluating potential acquisition targets in the mid-market." } },
            { text: "Uses data providers extensively for company research", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Ironbridge Capital tech stack", result: "Ironbridge Capital is a heavy user of data providers including PitchBook, ZoomInfo, and D&B for deal sourcing research." } },
          ],
        },
      ],
    },

    "Jupiter Communications": {
      reasoning: "Searching for Jupiter Communications contacts in sales. Telecom companies often have large sales organizations.",
      prospects: [
        {
          name: "Angela Brooks",
          title: "VP of SMB Sales",
          email: "a.brooks@jupitercomm.com",
          phone: "(813) 555-0200",
          department: "Sales",
          seniority: "VP",
          score: 81,
          source: { label: "ZoomInfo" },
          reason: "Large SMB sales team, high-volume prospecting needs",
          bullets: [
            { text: "Manages SMB sales team of 60+ reps with high-volume outbound", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Angela Brooks VP SMB Sales Jupiter Communications", result: "Angela Brooks leads the SMB sales division at Jupiter Communications with 65 reps doing high-volume outbound prospecting." } },
            { text: "Current contract with competitor expiring in Q3 2026", source: { label: "Salesforce" }, evidence: { tool: "Lookup CRM", recordName: "Angela Brooks", fields: [{ label: "Competitor", value: "Apollo.io" }, { label: "Contract End", value: "Sep 30, 2026" }, { label: "Status", value: "Evaluating alternatives" }] } },
          ],
        },
      ],
    },

    "Keystone Brewing Company": {
      reasoning: "Searching for Keystone Brewing contacts in sales and distribution. Beverage companies have distributor-based sales models.",
      prospects: [
        {
          name: "Mike O'Sullivan",
          title: "Director of On-Premise Sales",
          email: "m.osullivan@keystonebrewing.com",
          phone: "(215) 555-0200",
          department: "Sales",
          seniority: "Director",
          score: 44,
          source: { label: "ZoomInfo" },
          reason: "Distributor-based sales model, limited prospecting tool fit",
          bullets: [
            { text: "Manages on-premise sales through distributor network", source: { label: "ZoomInfo" }, evidence: { tool: "Research ZoomInfo", search: "Mike O'Sullivan Sales Keystone Brewing", result: "Mike O'Sullivan manages on-premise sales at Keystone Brewing Company, working through a network of regional distributors." } },
          ],
        },
      ],
    },
  };

  window.PROSPECT_BY_ACCOUNT = byAccount;

  const flat = [];
  Object.keys(byAccount).forEach((accountName) => {
    const entry = byAccount[accountName];
    const list = Array.isArray(entry) ? entry : entry.prospects || [];
    list.forEach((prospect) => {
      flat.push(Object.assign({ account: accountName }, prospect));
    });
  });
  window.PROSPECT_DATA_FLAT = flat;
})();
