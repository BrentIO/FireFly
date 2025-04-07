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
                        text: 'Configuration',
                        link: '/controller/software/controller/configuration/index.md',
                        collapsed: true,
                        items: [
                          { 
                            text: 'Controllers',
                            link: '/controller/software/controller/configuration/controllers'
                          },
                          { 
                            text: 'Clients',
                            link: '/controller/software/controller/configuration/clients'
                          },
                          { 
                            text: 'Inputs',
                            link: '/controller/software/controller/configuration/inputs'
                          },
                          { 
                            text: 'Outputs',
                            link: '/controller/software/controller/configuration/outputs'
                          },
                          { 
                            text: 'Circuits',
                            link: '/controller/software/controller/configuration/circuits'
                          },
                          { 
                            text: 'Breakers',
                            link: '/controller/software/controller/configuration/breakers'
                          },
                          { 
                            text: 'Configuration: Areas',
                            link: '/controller/software/controller/configuration/areas'
                          },
                          { 
                            text: 'Configuration: Certificates',
                            link: '/controller/software/controller/configuration/certificates'
                          },
                          { 
                            text: 'Configuration: Colors',
                            link: '/controller/software/controller/configuration/colors'
                          },
                          { 
                            text: 'Configuration: Icons',
                            link: '/controller/software/controller/configuration/icons'
                          },
                          { 
                            text: 'Configuration: MQTT',
                            link: '/controller/software/controller/configuration/mqtt'
                          },
                          { 
                            text: 'Configuration: OTA Updates',
                            link: '/controller/software/controller/configuration/ota'
                          },
                          { 
                            text: 'Configuration: Tags',
                            link: '/controller/software/controller/configuration/tags'
                          },
                          { 
                            text: 'Configuration: WiFi',
                            link: '/controller/software/controller/configuration/wifi'
                          },
                          { 
                            text: 'Configuration: Import',
                            link: '/controller/software/controller/configuration/import'
                          },
                          { 
                            text: 'Configuration: Export',
                            link: '/controller/software/controller/configuration/export'
                          },
                          { 
                            text: 'Configuration: Reset',
                            link: '/controller/software/controller/configuration/reset'
                          },
                          { 
                            text: 'Reports: Bill of Materials',
                            link: '/controller/software/controller/configuration/bom'
                          },
                          { 
                            text: 'Reports: Control Circuits',
                            link: '/controller/software/controller/configuration/control_circuits'
                          }


                        ]
                      },
                      { 
                        text: 'API Reference',
                        link: '/controller/software/controller/api_reference'
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
                    text: 'Home Assistant Auto Discovery and MQTT',
                    collapsed: true,
                    items:[
                      {
                        text: 'Home Assistant Auto Discovery',
                        link: '/controller/support/mqtt/auto_discovery'
                      },
                      {
                        text: 'Automating with Input Events using MQTT',
                        link: '/controller/support/mqtt/inputs'
                      }
                    ]
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
                    text: 'Performance Testing',
                    link: '/controller/support/performance_testing'
                  },
                  { 
                    text: 'Provisioning Mode',
                    link: '/controller/support/provisioning_mode'
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
                  {
                    text: 'Tag Usage',
                    link: '/controller/support/tag_usage'
                  },
                ]
              },
              {
                text: 'Development Environment',
                link: '/controller/development_environment/index.md'
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
          },
          { 
            text: 'Best Practices',
            link: '/best_practices'
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