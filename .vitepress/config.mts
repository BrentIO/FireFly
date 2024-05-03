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
            collapsed: false,
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
                    text: 'Hardware Registration and Configuration Firmware',
                    link: 'https://github.com/BrentIO/FireFly-Controller/tree/main/Hardware-Registration-and-Configuration'
                      { 
                        text: 'API Reference',
                        link: '/controller/software/hardware_registration_and_configuration/api_reference'
                      },
                  },
                  { text: 'Controller Firmware',
                    link: 'https://github.com/BrentIO/FireFly-Controller/tree/main/Controller'
                  }
                ]
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
                  {
                    text: 'Abbreviations',
                    link: '/controller/support/abbreviations'
                  },
                  {
                    text: 'Failure Reason Codes',
                    link: '/controller/support/failure_reason_codes'
                  },
                  {
                    text: 'OLED Screens',
                    link: '/controller/support/OLED_screens/'
                  }
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
            collapsed: false,
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
