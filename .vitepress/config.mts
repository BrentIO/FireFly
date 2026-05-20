import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === 'asyncapi-component'
      }
    }
  },
  title: "Project FireFly",
  description: "Software-defined lighting",
  base: '/',
  cleanUrls: true,
  ignoreDeadLinks: [/\.drawio$/, /\.stl$/],
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local'
    },
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
                        text: 'FFC0806-2505',
                        link: '/controller/hardware/FFC0806_2505/'
                      },
                      {
                        text: 'FFC0806-2305',
                        link: '/controller/hardware/FFC0806_2305/'
                      },
                      {
                        text: 'FFC3232-2603',
                        link: '/controller/hardware/FFC3232_2603/'
                      },
                      {
                        text: 'FFC3232-2505',
                        link: '/controller/hardware/FFC3232_2505/'
                      },
                      {
                        text: 'FFC3232-2211',
                        link: '/controller/hardware/FFC3232_2211/'
                      }
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
                    text: 'Hardware Registration and Configuration Application',
                    collapsed: true,
                    link: '/controller/software/hardware_registration_and_configuration/',
                    items:[
                      {
                        text: 'Cloud Registration',
                        link: '/controller/software/hardware_registration_and_configuration/cloud-registration'
                      },
                      {
                        text: 'API Reference',
                        link: '/controller/software/hardware_registration_and_configuration/api_reference'
                      },
                    ]
                  },
                  {
                    text: 'Controller Application',
                    collapsed: true,
                    link: '/controller/software/controller/',
                    items:[
                      {
                        text: 'Configurator',
                        link: '/controller/software/controller/configuration/',
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
                            text: 'Areas',
                            link: '/controller/software/controller/configuration/areas'
                          },
                          {
                            text: 'Certificates',
                            link: '/controller/software/controller/configuration/certificates'
                          },
                          {
                            text: 'Colors',
                            link: '/controller/software/controller/configuration/colors'
                          },
                          {
                            text: 'Icons',
                            link: '/controller/software/controller/configuration/icons'
                          },
                          {
                            text: 'MQTT',
                            link: '/controller/software/controller/configuration/mqtt'
                          },
                          {
                            text: 'OTA Updates',
                            link: '/controller/software/controller/configuration/ota'
                          },
                          {
                            text: 'Tags',
                            link: '/controller/software/controller/configuration/tags'
                          },
                          {
                            text: 'WiFi',
                            link: '/controller/software/controller/configuration/wifi'
                          },
                          {
                            text: 'Import',
                            link: '/controller/software/controller/configuration/import'
                          },
                          {
                            text: 'Export',
                            link: '/controller/software/controller/configuration/export'
                          },
                          {
                            text: 'Reset',
                            link: '/controller/software/controller/configuration/reset'
                          },
                          {
                            text: 'Bill of Materials',
                            link: '/controller/software/controller/configuration/bom'
                          },
                          {
                            text: 'Control Circuits',
                            link: '/controller/software/controller/configuration/control_circuits'
                          },
                          {
                            text: 'Online Configurator',
                            link: process.env.CONFIGURATOR_URL ?? 'https://configurator.fireflylx.com'
                          }

                        ]
                      },
                      {
                        text: 'API Reference',
                        link: '/controller/software/controller/api_reference'
                      },
                      {
                        text: 'MQTT Reference',
                        link: '/controller/software/controller/mqtt_reference'
                      },
                    ]
                  },
                  {
                    text: 'API Testing',
                    link: '/controller/software/testing'
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
                    text: 'Cloud Backup',
                    link: '/controller/support/cloud_backup'
                  },
                  {
                    text: 'Home Assistant and MQTT Automation',
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
                    text: 'Provisioning Mode',
                    link: '/controller/support/provisioning_mode'
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
            ]
          },
          { 
            text: 'Client',
            collapsed: true,
            items: [
              {
                text: 'Hardware',
                collapsed: true,
                link: '/client/hardware/',
                items: [
                  {
                    text: 'Versions',
                    collapsed: true,
                    items:[
                      {
                        text: 'FFI0600-2011',
                        link: '/client/hardware/FFI0600_2011/'
                      }
                    ]
                  }
                ]
              },
              {
                text: 'Software',
                collapsed: true,
                items: [
                  {
                    text: 'Hardware Registration and Configuration',
                    collapsed: true,
                    link: '/client/hardware_registration/',
                    items: [
                      {
                        text: 'API Reference',
                        link: '/client/hardware_registration/api_reference'
                      }
                    ]
                  },
                  {
                    text: 'Client Application',
                    collapsed: true,
                    link: '/client/software/client/',
                    items: [
                      {
                        text: 'MQTT Reference',
                        link: '/client/software/client/mqtt_reference'
                      }
                    ]
                  },
                ]
              },
              {
                text: 'Documentation and Support',
                collapsed: true,
                items: [
                  {
                    text: 'Home Assistant and MQTT Automation',
                    collapsed: true,
                    items: [
                      {
                        text: 'Home Assistant Auto Discovery',
                        link: '/client/support/mqtt/auto_discovery'
                      },
                      {
                        text: 'Automating with Tag Commands using MQTT',
                        link: '/client/support/mqtt/tags'
                      }
                    ]
                  },
                  {
                    text: 'OTA Updates',
                    link: '/client/support/ota_updates'
                  },
                  {
                    text: 'Migrating from v1.14',
                    link: '/client/support/migration_v114'
                  },
                  {
                    text: 'LED Flash Patterns',
                    link: '/client/support/failure_led_patterns'
                  },
                  {
                    text: 'ESP8266 Special Handling',
                    link: '/client/esp8266_special_handling/'
                  },
                  {
                    text: 'Client Provisioning',
                    link: '/client/provisioning/'
                  },
                ]
              },
            ]
          },
          {
            text: 'Cloud',
            collapsed: true,
            link: '/cloud/index',
            items: [
              {
                text: 'AWS Account Setup',
                link: '/cloud/aws-account-setup'
              },
              {
                text: 'FireFly Management Console',
                link: '/cloud/fmc',
                collapsed: true,
                items: [
                  {
                    text: 'User Management',
                    link: '/cloud/administration'
                  },
                  {
                    text: 'Authentication',
                    link: '/cloud/authentication'
                  },
                  {
                    text: 'Firmware Lifecycle',
                    link: '/cloud/firmware_lifecycle'
                  },
                ]
              },
              {
                text: 'Infrastructure',
                collapsed: true,
                items: [
                  {
                    text: 'Lambda Functions',
                    collapsed: true,
                    items: [
                      {
                        text: 'func-api-appconfig-get',
                        link: '/cloud/lambdas/func-api-appconfig-get'
                      },
                      {
                        text: 'func-api-appconfig-patch',
                        link: '/cloud/lambdas/func-api-appconfig-patch'
                      },
                      {
                        text: 'func-api-devices-backup-delete',
                        link: '/cloud/lambdas/func-api-devices-backup-delete'
                      },
                      {
                        text: 'func-api-devices-backup-get',
                        link: '/cloud/lambdas/func-api-devices-backup-get'
                      },
                      {
                        text: 'func-api-devices-backup-post',
                        link: '/cloud/lambdas/func-api-devices-backup-post'
                      },
                      {
                        text: 'func-api-devices-get',
                        link: '/cloud/lambdas/func-api-devices-get'
                      },
                      {
                        text: 'func-api-devices-register-post',
                        link: '/cloud/lambdas/func-api-devices-register-post'
                      },
                      {
                        text: 'func-api-devices-registration-get',
                        link: '/cloud/lambdas/func-api-devices-registration-get'
                      },
                      {
                        text: 'func-api-firmware-delete',
                        link: '/cloud/lambdas/func-api-firmware-delete'
                      },
                      {
                        text: 'func-api-firmware-download-get',
                        link: '/cloud/lambdas/func-api-firmware-download-get'
                      },
                      {
                        text: 'func-api-firmware-get',
                        link: '/cloud/lambdas/func-api-firmware-get'
                      },
                      {
                        text: 'func-api-firmware-status-patch',
                        link: '/cloud/lambdas/func-api-firmware-status-patch'
                      },
                      {
                        text: 'func-api-health-get',
                        link: '/cloud/lambdas/func-api-health-get'
                      },
                      {
                        text: 'func-api-ota-get',
                        link: '/cloud/lambdas/func-api-ota-get'
                      },
                      {
                        text: 'func-api-registration-keys-get',
                        link: '/cloud/lambdas/func-api-registration-keys-get'
                      },
                      {
                        text: 'func-api-registration-keys-post',
                        link: '/cloud/lambdas/func-api-registration-keys-post'
                      },
                      {
                        text: 'func-api-users-delete',
                        link: '/cloud/lambdas/func-api-users-delete'
                      },
                      {
                        text: 'func-api-users-get',
                        link: '/cloud/lambdas/func-api-users-get'
                      },
                      {
                        text: 'func-api-users-patch',
                        link: '/cloud/lambdas/func-api-users-patch'
                      },
                      {
                        text: 'func-api-users-post',
                        link: '/cloud/lambdas/func-api-users-post'
                      },
                      {
                        text: 'func-cognito-pre-signup',
                        link: '/cloud/lambdas/func-cognito-pre-signup'
                      },
                      {
                        text: 'func-s3-firmware-deleted',
                        link: '/cloud/lambdas/func-s3-firmware-deleted'
                      },
                      {
                        text: 'func-s3-firmware-uploaded',
                        link: '/cloud/lambdas/func-s3-firmware-uploaded'
                      },
                    ]
                  },
                  {
                    text: 'Deployment and Deletion',
                    collapsed: true,
                    items: [
                      {
                        text: 'Overview',
                        link: '/cloud/github_actions/index'
                      },
                      {
                        text: 'acm',
                        link: '/cloud/github_actions/acm'
                      },
                      {
                        text: 'api-gateway',
                        link: '/cloud/github_actions/api-gateway'
                      },
                      {
                        text: 'cloudfront-configurator',
                        link: '/cloud/github_actions/cloudfront-configurator'
                      },
                      {
                        text: 'cloudfront-firmware',
                        link: '/cloud/github_actions/cloudfront-firmware'
                      },
                      {
                        text: 'cloudfront-fmc',
                        link: '/cloud/github_actions/cloudfront-fmc'
                      },
                      {
                        text: 'cognito',
                        link: '/cloud/github_actions/cognito'
                      },
                      {
                        text: 'configurator-ui',
                        link: '/cloud/github_actions/configurator-ui'
                      },
                      {
                        text: 'dynamodb-devices',
                        link: '/cloud/github_actions/dynamodb-devices'
                      },
                      {
                        text: 'dynamodb-firmware',
                        link: '/cloud/github_actions/dynamodb-firmware'
                      },
                      {
                        text: 'dynamodb-registration-keys',
                        link: '/cloud/github_actions/dynamodb-registration-keys'
                      },
                      {
                        text: 'dynamodb-users',
                        link: '/cloud/github_actions/dynamodb-users'
                      },
                      {
                        text: 'func-api-appconfig-get',
                        link: '/cloud/github_actions/func-api-appconfig-get'
                      },
                      {
                        text: 'func-api-appconfig-patch',
                        link: '/cloud/github_actions/func-api-appconfig-patch'
                      },
                      {
                        text: 'func-api-devices-backup-delete',
                        link: '/cloud/github_actions/func-api-devices-backup-delete'
                      },
                      {
                        text: 'func-api-devices-backup-get',
                        link: '/cloud/github_actions/func-api-devices-backup-get'
                      },
                      {
                        text: 'func-api-devices-backup-post',
                        link: '/cloud/github_actions/func-api-devices-backup-post'
                      },
                      {
                        text: 'func-api-devices-get',
                        link: '/cloud/github_actions/func-api-devices-get'
                      },
                      {
                        text: 'func-api-devices-register-post',
                        link: '/cloud/github_actions/func-api-devices-register-post'
                      },
                      {
                        text: 'func-api-devices-registration-get',
                        link: '/cloud/github_actions/func-api-devices-registration-get'
                      },
                      {
                        text: 'func-api-firmware-delete',
                        link: '/cloud/github_actions/func-api-firmware-delete'
                      },
                      {
                        text: 'func-api-firmware-download-get',
                        link: '/cloud/github_actions/func-api-firmware-download-get'
                      },
                      {
                        text: 'func-api-firmware-get',
                        link: '/cloud/github_actions/func-api-firmware-get'
                      },
                      {
                        text: 'func-api-firmware-status-patch',
                        link: '/cloud/github_actions/func-api-firmware-status-patch'
                      },
                      {
                        text: 'func-api-health-get',
                        link: '/cloud/github_actions/func-api-health-get'
                      },
                      {
                        text: 'func-api-ota-get',
                        link: '/cloud/github_actions/func-api-ota-get'
                      },
                      {
                        text: 'func-api-registration-keys-get',
                        link: '/cloud/github_actions/func-api-registration-keys-get'
                      },
                      {
                        text: 'func-api-registration-keys-post',
                        link: '/cloud/github_actions/func-api-registration-keys-post'
                      },
                      {
                        text: 'func-api-users-delete',
                        link: '/cloud/github_actions/func-api-users-delete'
                      },
                      {
                        text: 'func-api-users-get',
                        link: '/cloud/github_actions/func-api-users-get'
                      },
                      {
                        text: 'func-api-users-patch',
                        link: '/cloud/github_actions/func-api-users-patch'
                      },
                      {
                        text: 'func-api-users-post',
                        link: '/cloud/github_actions/func-api-users-post'
                      },
                      {
                        text: 'func-cognito-pre-signup',
                        link: '/cloud/github_actions/func-cognito-pre-signup'
                      },
                      {
                        text: 'func-s3-firmware-deleted',
                        link: '/cloud/github_actions/func-s3-firmware-deleted'
                      },
                      {
                        text: 'func-s3-firmware-uploaded',
                        link: '/cloud/github_actions/func-s3-firmware-uploaded'
                      },
                      {
                        text: 'integration-tests',
                        link: '/cloud/github_actions/integration-tests'
                      },
                      {
                        text: 's3-configurator',
                        link: '/cloud/github_actions/s3-configurator'
                      },
                      {
                        text: 's3-device-backups',
                        link: '/cloud/github_actions/s3-device-backups'
                      },
                      {
                        text: 's3-firmware',
                        link: '/cloud/github_actions/s3-firmware'
                      },
                      {
                        text: 's3-firmware-public',
                        link: '/cloud/github_actions/s3-firmware-public'
                      },
                      {
                        text: 's3-fmc',
                        link: '/cloud/github_actions/s3-fmc'
                      },
                      {
                        text: 'shared-layer',
                        link: '/cloud/github_actions/shared-layer'
                      },
                      {
                        text: 'fmc-app',
                        link: '/cloud/github_actions/fmc-app'
                      },
                    ]
                  },
                ]
              },
              {
                text: 'API Reference',
                link: '/cloud/api_reference'
              },
            ]
          },
          {
            text: 'Development Environments',
            collapsed: true,
            items: [
              {
                text: 'Controller',
                link: '/controller/development_environment/'
              },
              {
                text: 'Client',
                link: '/client/development_environment/'
              },
              {
                text: 'Cloud',
                link: '/cloud/development_environment'
              },
              {
                text: 'Docs',
                link: '/docs/development_environment'
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