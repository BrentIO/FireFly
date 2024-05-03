import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Project FireFly",
  description: "Software-defined lighting",
  base: '/FireFly/',
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { 
        text: 'Home', 
        link: '/getting_started'
      }
    ],

    sidebar:
      {
        '/':[
          { 
            text: 'Controller',
            collapsed: true,
            link: '/controller/',
            items: [
              {
                text: 'Hardware',
                collapsed: true,
                link: '/controller/hardware/',
                items: [
                  { 
                    text: 'Versions',
                    collapsed: true,
                    items:[
                      {
                        text: 'FFC0806-2305',
                        link: '/controller/hardware/FFC0806_2305/'
                      },
                      {
                        text: 'FFC3232-2211',
                        link: '/controller/hardware/FFC3232_2211/'
                      },
                    ]
                  },
                  {
                    text: 'High Voltage Relays',
                    link: '/controller/hardware/relays'
                  },
                ]
              },
              {
                text: 'Software',
                collapsed: true,
                items: [
                  {
                    text: 'Controller Application',
                    collapsed: true,
                    link: '/controller/software/controller/index.md',
                    items:[                  
                      { 
                        text: 'Power Supply Configuration',
                      },
                      { 
                        text: 'Circuit Configuration',
                      },
                      { 
                        text: 'Input Configuration',
                      },
                      { 
                        text: 'Output Configuration',
                      },
                      { 
                        text: 'Action Configuration',
                      },
                      { 
                        text: 'MQTT Configuration',
                      },
                      { 
                        text: 'API Reference',
                      },
                    ]
                  },
                  {
                    text: 'Hardware Registration and Configuration Application',
                    collapsed: true,
                    link: '/controller/software/hardware_registration_and_configuration/index.md',
                    items:[
                      { 
                        text: 'API Reference',
                        link: '/controller/software/hardware_registration_and_configuration/api_reference'
                      },
                    ]
                  },
                  { 
                    text: 'Download Firmware from GitHub',
                    link: 'https://github.com/BrentIO/FireFly-Controller/releases'
                  }
                ]
              },
              {
                text: 'Documentation and Support',
                collapsed: true,
                items: [
                  { 
                    text: 'Certificate Management',
                    link: '/controller/support/certificate_management'
                  },
                  { 
                    text: 'OTA Updates',
                    link: '/controller/support/ota_updates'
                  },
                  { 
                    text: 'Home Assistant'
                  },
                  { 
                    text: 'Event and Error Logs',
                    link: '/controller/support/event_and_error_logs'
                  },
                  { 
                    text: 'Partitions',
                    link: '/controller/support/partitions'
                  },
                  { 
                    text: 'Troubleshooting'
                  },
                  {
                    text: 'OLED Screens',
                    link: '/controller/support/OLED_screens/'
                  },
                  {
                    text: 'Abbreviations',
                    link: '/controller/support/abbreviations'
                  },
                  {
                    text: 'Failure Reason Codes',
                    link: '/controller/support/failure_reason_codes'
                  },
                ]
              },
              {
                text: 'Development Environment',
                link: '/controller/development_environment'
              },
            ]
          },
          { 
            text: 'Client',
            collapsed: true,
            items: [
              {
                text: 'Hardware',
                collapsed: true,
                items: [
                  { 
                    text: 'Versions',
                    collapsed: true,
                    items:[]
                  }
                ]
              },
              {
                text: 'Software',
                collapsed: true,
                items: []
              },
              {
                text: 'Documentation and Support',
                collapsed: true,
                items: [
                  { 
                    text: 'Home Assistant'
                  },
                  { 
                    text: 'Troubleshooting'
                  },
                ]
              },
              {
                text: 'Development Environment'
              },
            ]
          }
        ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/BrentIO/FireFly-Controller'
      }
    ]
  }
})