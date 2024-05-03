# Certificate Management
Certificates must be managed directly with the device specifically due to the processing limitations of the microcontroller.  Unlike a computer's operating system, which ships with all the Root Certificate Authorities (Root CA's) required to browse the internet, the microcontroller does not.  Due to limited storage space, only the required certificates can be loaded onto the device.

Certificates are stored in the [`config` partition](/controller/support/partitions).

## Obtaining a Root Certificate
Root certificates can be obtained using OpenSSL.  The Root CA _should_ be the last certificate presented.

> [!NOTE]  
> Replace `server.myhost.com` in the examples below with your fully-qualified domain name.


You can visually see all the certificates that are sent back by the client:
```bash
openssl s_client -showcerts -verify 5 -connect server.myhost.com:443
```

Outputs:
```
verify depth is 5
Connecting to 99.84.252.106
CONNECTED(00000006)
depth=2 C=US, O=Amazon, CN=Amazon Root CA 1
verify return:1
depth=1 C=US, O=Amazon, CN=Amazon RSA 2048 M03
verify return:1
depth=0 CN=*.myhost.com
verify return:1
---
Certificate chain
 0 s:CN=*.myhost.com
   i:C=US, O=Amazon, CN=Amazon RSA 2048 M03
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Mar 31 00:00:00 2024 GMT; NotAfter: Apr 29 23:59:59 2025 GMT
-----BEGIN CERTIFICATE-----
MIIF0zCCBLugAwIBAgIQBHjOGsB4q79K/UXEp7gyPzANBgkqhkiG9w0BAQsFADA8
MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRwwGgYDVQQDExNBbWF6b24g
UlNBIDIwNDggTTAzMB4XDTI0MDMzMTAwMDAwMFoXDTI1MDQyOTIzNTk1OVowHzEd
MBsGA1UEAwwUKi5tb25vcmFpbHllbGxvdy5jb20wggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQCoNZDizHcFRLAzQBUw99r8ZoDIqDZG6ktz46N5BJCuVWVt
BPzJsOvNfgdiiQieqQigVlsFBMaCfQVTGqozykT1Ni65+Xc/kMvmTpr6Z3FWbpgK
in879O/8w5BMo4WlwbhC+w0GLHiQeMXZ5UruopWu2DXT75FChpPDNTudH497/io1
pVDA76NTdcByEFRWymrkGXEN1Bc2OmYfdm0+WP72YRWUPHafKJC7xnfaT5texRUs
0a66mO2tK8DmJc4rbEJknNchsU0/KFwGpWCNvtW0Pm9j1eze2nT2e+J9hpwu/ch0
SzOO+L8ltdn7cMFaBIBt1nsdJGNeus3Cp2/YDCSVAgMBAAGjggLsMIIC6DAfBgNV
HSMEGDAWgBRV2Rhf0hzMAeFYtL6r2VVCAdcuAjAdBgNVHQ4EFgQUSpn3K49fhsoW
wp0wp8JIIUGfPN8wHwYDVR0RBBgwFoIUKi5tb25vcmFpbHllbGxvdy5jb20wEwYD
VR0gBAwwCjAIBgZngQwBAgEwDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsG
AQUFBwMBBggrBgEFBQcDAjA7BgNVHR8ENDAyMDCgLqAshipodHRwOi8vY3JsLnIy
bTAzLmFtYXpvbnRydXN0LmNvbS9yMm0wMy5jcmwwdQYIKwYBBQUHAQEEaTBnMC0G
CCsGAQUFBzABhiFodHRwOi8vb2NzcC5yMm0wMy5hbWF6b250cnVzdC5jb20wNgYI
KwYBBQUHMAKGKmh0dHA6Ly9jcnQucjJtMDMuYW1hem9udHJ1c3QuY29tL3IybTAz
LmNlcjAMBgNVHRMBAf8EAjAAMIIBfQYKKwYBBAHWeQIEAgSCAW0EggFpAWcAdQDP
EVbu1S58r/OHW9lpLpvpGnFnSrAX7KwB0lt3zsw7CAAAAY6VC1UjAAAEAwBGMEQC
IDObwTHV3gLD5l6RCWhpkm76iHnZrBTbJzBg3NTLyrbBAiAoMOPumEyP3K6aVYlh
Xu3Ji4QWZ6omy784SwKTjAPClQB2AH1ZHhLheCp7HGFnfF79+NCHXBSgTpWeuQMv
2Q6MLnm4AAABjpULVJoAAAQDAEcwRQIhAOSc8mdW/9bZwoTyuyakctysygTRX97v
CIz8ergXBakxAiA3jBX+fOpbZbV5HzaWi6eJSlNuEOeSMTHhGViMmtivTAB2AObS
MWNAd4zBEEEG13G5zsHSQPaWhIb7uocyHf0eN45QAAABjpULVKwAAAQDAEcwRQIh
AP0UVhgN8AuFQ9NzRrDwuBy07JNW+723u/iFYNVH+v8+AiAhEQuTuN/8W5RAaLxg
G7QTbtiTeTgx/aV2CBWgkT94PjANBgkqhkiG9w0BAQsFAAOCAQEAd1qrUvzvAxiy
ov6ut+34qL3nfpPe/EamPfdBJG+3V+fqxKeuN0bXpzlgb+pq+HtSF/M6zfSpS/np
zQEv0U9TmRlY+GQzVzfxUZ/1gXUUtX6pm2aQ4ICOoJ1R239XtNeQADUaM1jEy4LG
Ww9fvpm+I7ZBNVZD/Ky8ctnWt03uqGT8H4XbPzs5il3psHsgzCL1jY6ZJOIDMkYH
LkX56CahQ6Ze/NXu+PrpNmcd2eYNambFWh3jcftXCcMOLvDghTNMKSfgGwtmYzuq
0V/Ydw7Q0SERnlY+h+HJoD9xK+BchnyXxZbLjR2pxdimTXT43tcm8YjOa3CWFzt+
qSpJqyY9mA==
-----END CERTIFICATE-----
 1 s:C=US, O=Amazon, CN=Amazon RSA 2048 M03
   i:C=US, O=Amazon, CN=Amazon Root CA 1
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Aug 23 22:26:04 2022 GMT; NotAfter: Aug 23 22:26:04 2030 GMT
-----BEGIN CERTIFICATE-----
MIIEXjCCA0agAwIBAgITB3MSTNQG0mfAmRzdKZqfODF5hTANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTIyMDgyMzIyMjYwNFoXDTMwMDgyMzIyMjYwNFowPDEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEcMBoGA1UEAxMTQW1hem9uIFJT
QSAyMDQ4IE0wMzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALd/pVko
8vuM475Tf45HV3BbCl/B9Jy89G1CRkFjcPY06WA9lS+7dWbUA7GtWUKoksr69hKM
wcMsNpxlw7b3jeXFgxB09/nmalcAWtnLzF+LaDKEA5DQmvKzuh1nfIfqEiKCQSmX
Xh09Xs+dO7cm5qbaL2hhNJCSAejciwcvOFgFNgEMR42wm6KIFHsQW28jhA+1u/M0
p6fVwReuEgZfLfdx82Px0LJck3lST3EB/JfbdsdOzzzg5YkY1dfuqf8y5fUeZ7Cz
WXbTjujwX/TovmeWKA36VLCz75azW6tDNuDn66FOpADZZ9omVaF6BqNJiLMVl6P3
/c0OiUMC6Z5OfKcCAwEAAaOCAVowggFWMBIGA1UdEwEB/wQIMAYBAf8CAQAwDgYD
VR0PAQH/BAQDAgGGMB0GA1UdJQQWMBQGCCsGAQUFBwMBBggrBgEFBQcDAjAdBgNV
HQ4EFgQUVdkYX9IczAHhWLS+q9lVQgHXLgIwHwYDVR0jBBgwFoAUhBjMhTTsvAyU
lC4IWZzHshBOCggwewYIKwYBBQUHAQEEbzBtMC8GCCsGAQUFBzABhiNodHRwOi8v
b2NzcC5yb290Y2ExLmFtYXpvbnRydXN0LmNvbTA6BggrBgEFBQcwAoYuaHR0cDov
L2NydC5yb290Y2ExLmFtYXpvbnRydXN0LmNvbS9yb290Y2ExLmNlcjA/BgNVHR8E
ODA2MDSgMqAwhi5odHRwOi8vY3JsLnJvb3RjYTEuYW1hem9udHJ1c3QuY29tL3Jv
b3RjYTEuY3JsMBMGA1UdIAQMMAowCAYGZ4EMAQIBMA0GCSqGSIb3DQEBCwUAA4IB
AQAGjeWm2cC+3z2MzSCnte46/7JZvj3iQZDY7EvODNdZF41n71Lrk9kbfNwerK0d
VNzW36Wefr7j7ZSwBVg50W5ay65jNSN74TTQV1yt4WnSbVvN6KlMs1hiyOZdoHKs
KDV2UGNxbdoBYCQNa2GYF8FQIWLugNp35aSOpMy6cFlymFQomIrnOQHwK1nvVY4q
xDSJMU/gNJz17D8ArPN3ngnyZ2TwepJ0uBINz3G5te2rdFUF4i4Y3Bb7FUlHDYm4
u8aIRGpk2ZpfXmxaoxnbIBZRvGLPSUuPwnwoUOMsJ8jirI5vs2dvchPb7MtI1rle
i02f2ivH2vxkjDLltSpe2fiC
-----END CERTIFICATE-----
 2 s:C=US, O=Amazon, CN=Amazon Root CA 1
   i:C=US, ST=Arizona, L=Scottsdale, O=Starfield Technologies, Inc., CN=Starfield Services Root Certificate Authority - G2
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: May 25 12:00:00 2015 GMT; NotAfter: Dec 31 01:00:00 2037 GMT
-----BEGIN CERTIFICATE-----
MIIEkjCCA3qgAwIBAgITBn+USionzfP6wq4rAfkI7rnExjANBgkqhkiG9w0BAQsF
ADCBmDELMAkGA1UEBhMCVVMxEDAOBgNVBAgTB0FyaXpvbmExEzARBgNVBAcTClNj
b3R0c2RhbGUxJTAjBgNVBAoTHFN0YXJmaWVsZCBUZWNobm9sb2dpZXMsIEluYy4x
OzA5BgNVBAMTMlN0YXJmaWVsZCBTZXJ2aWNlcyBSb290IENlcnRpZmljYXRlIEF1
dGhvcml0eSAtIEcyMB4XDTE1MDUyNTEyMDAwMFoXDTM3MTIzMTAxMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaOCATEwggEtMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/
BAQDAgGGMB0GA1UdDgQWBBSEGMyFNOy8DJSULghZnMeyEE4KCDAfBgNVHSMEGDAW
gBScXwDfqgHXMCs4iKK4bUqc8hGRgzB4BggrBgEFBQcBAQRsMGowLgYIKwYBBQUH
MAGGImh0dHA6Ly9vY3NwLnJvb3RnMi5hbWF6b250cnVzdC5jb20wOAYIKwYBBQUH
MAKGLGh0dHA6Ly9jcnQucm9vdGcyLmFtYXpvbnRydXN0LmNvbS9yb290ZzIuY2Vy
MD0GA1UdHwQ2MDQwMqAwoC6GLGh0dHA6Ly9jcmwucm9vdGcyLmFtYXpvbnRydXN0
LmNvbS9yb290ZzIuY3JsMBEGA1UdIAQKMAgwBgYEVR0gADANBgkqhkiG9w0BAQsF
AAOCAQEAYjdCXLwQtT6LLOkMm2xF4gcAevnFWAu5CIw+7bMlPLVvUOTNNWqnkzSW
MiGpSESrnO09tKpzbeR/FoCJbM8oAxiDR3mjEH4wW6w7sGDgd9QIpuEdfF7Au/ma
eyKdpwAJfqxGF4PcnCZXmTA5YpaP7dreqsXMGz7KQ2hsVxa81Q4gLv7/wmpdLqBK
bRRYh5TmOTFffHPLkIhqhBGWJ6bt2YFGpn6jcgAKUj6DiAdjd4lpFw85hdKrCEVN
0FE6/V1dN2RMfjCyVSRCnTawXZwXgWHxyvkQAiSr6w10kY17RSlQOYiypok1JR4U
akcjMS9cmvqtmg5iUaQqqcT5NJ0hGA==
-----END CERTIFICATE-----
 3 s:C=US, ST=Arizona, L=Scottsdale, O=Starfield Technologies, Inc., CN=Starfield Services Root Certificate Authority - G2
   i:C=US, O=Starfield Technologies, Inc., OU=Starfield Class 2 Certification Authority
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Sep  2 00:00:00 2009 GMT; NotAfter: Jun 28 17:39:16 2034 GMT
-----BEGIN CERTIFICATE-----
MIIEdTCCA12gAwIBAgIJAKcOSkw0grd/MA0GCSqGSIb3DQEBCwUAMGgxCzAJBgNV
BAYTAlVTMSUwIwYDVQQKExxTdGFyZmllbGQgVGVjaG5vbG9naWVzLCBJbmMuMTIw
MAYDVQQLEylTdGFyZmllbGQgQ2xhc3MgMiBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0
eTAeFw0wOTA5MDIwMDAwMDBaFw0zNDA2MjgxNzM5MTZaMIGYMQswCQYDVQQGEwJV
UzEQMA4GA1UECBMHQXJpem9uYTETMBEGA1UEBxMKU2NvdHRzZGFsZTElMCMGA1UE
ChMcU3RhcmZpZWxkIFRlY2hub2xvZ2llcywgSW5jLjE7MDkGA1UEAxMyU3RhcmZp
ZWxkIFNlcnZpY2VzIFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IC0gRzIwggEi
MA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDVDDrEKvlO4vW+GZdfjohTsR8/
y8+fIBNtKTrID30892t2OGPZNmCom15cAICyL1l/9of5JUOG52kbUpqQ4XHj2C0N
Tm/2yEnZtvMaVq4rtnQU68/7JuMauh2WLmo7WJSJR1b/JaCTcFOD2oR0FMNnngRo
Ot+OQFodSk7PQ5E751bWAHDLUu57fa4657wx+UX2wmDPE1kCK4DMNEffud6QZW0C
zyyRpqbn3oUYSXxmTqM6bam17jQuug0DuDPfR+uxa40l2ZvOgdFFRjKWcIfeAg5J
Q4W2bHO7ZOphQazJ1FTfhy/HIrImzJ9ZVGif/L4qL8RVHHVAYBeFAlU5i38FAgMB
AAGjgfAwge0wDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMCAYYwHQYDVR0O
BBYEFJxfAN+qAdcwKziIorhtSpzyEZGDMB8GA1UdIwQYMBaAFL9ft9HO3R+G9FtV
rNzXEMIOqYjnME8GCCsGAQUFBwEBBEMwQTAcBggrBgEFBQcwAYYQaHR0cDovL28u
c3MyLnVzLzAhBggrBgEFBQcwAoYVaHR0cDovL3guc3MyLnVzL3guY2VyMCYGA1Ud
HwQfMB0wG6AZoBeGFWh0dHA6Ly9zLnNzMi51cy9yLmNybDARBgNVHSAECjAIMAYG
BFUdIAAwDQYJKoZIhvcNAQELBQADggEBACMd44pXyn3pF3lM8R5V/cxTbj5HD9/G
VfKyBDbtgB9TxF00KGu+x1X8Z+rLP3+QsjPNG1gQggL4+C/1E2DUBc7xgQjB3ad1
l08YuW3e95ORCLp+QCztweq7dp4zBncdDQh/U90bZKuCJ/Fp1U1ervShw3WnWEQt
8jxwmKy6abaVd38PMV4s/KCHOkdp8Hlf9BRUpJVeEXgSYCfOn8J3/yNTd126/+pZ
59vPr5KW7ySaNRB6nJHGDn2Z9j8Z3/VyVOEVqQdZe4O/Ui5GjLIAZHYcSNPYeehu
VsyuLAOQ1xk4meTKCRlb/weWsKh/NEnfVqn3sF/tM+2MR7cwA130A4w=
-----END CERTIFICATE-----
---
Server certificate
subject=CN=*.myhost.com
issuer=C=US, O=Amazon, CN=Amazon RSA 2048 M03
---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: RSA-PSS
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 5495 bytes and written 401 bytes
Verification: OK
---
New, TLSv1.3, Cipher is TLS_AES_128_GCM_SHA256
Server public key is 2048 bit
This TLS version forbids renegotiation.
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
---
---
Post-Handshake New Session Ticket arrived:
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : TLS_AES_128_GCM_SHA256
    Session-ID: 538D49B40712970346984016B9AB241011D8BE2B586D0A154636F48F4E91567F
    Session-ID-ctx: 
    Resumption PSK: 027AF69A284DD4629885EE99F3443D5BB3D0693DA51D9C6DAE59F1F70808E095
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    TLS session ticket lifetime hint: 86400 (seconds)
    TLS session ticket:
    0000 - 31 37 31 34 36 37 39 38-37 34 30 30 30 00 00 00   1714679874000...
    0010 - 78 a9 ec 49 7a 36 5c 64-aa 38 2c b7 af d6 4e fb   x..Iz6\d.8,...N.
    0020 - bc 90 77 52 42 68 ee 92-7e e8 77 a5 19 ae 9f 75   ..wRBh..~.w....u
    0030 - 53 72 87 65 93 7e 12 65-2c 1e 62 b4 09 8b 26 28   Sr.e.~.e,.b...&(
    0040 - 30 9d ad bc 12 3d 59 6e-1e ae e1 a2 5e c1 54 c9   0....=Yn....^.T.
    0050 - b0 74 95 32 0d 47 73 1c-1f 7a d5 72 c1 07 1d a9   .t.2.Gs..z.r....
    0060 - 8f 5b b8 4f 49 75 99 11-d4                        .[.OIu...

    Start Time: 1714687770
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
    Extended master secret: no
    Max Early Data: 0
---
read R BLOCK
closed
```

In the above example, the certificate #3 is the root CA.  Note `CN=Starfield Services Root Certificate Authority - G2`.

---

To export all the certificates, this command can be used, which will output the certificate contents and name them per `CN=Starfield Services Root Certificate Authority - G2`
```bash
openssl s_client -showcerts -verify 5 -connect myhost.com:443 < /dev/null |
   awk '/BEGIN CERTIFICATE/,/END CERTIFICATE/{ if(/BEGIN CERTIFICATE/){a++}; out="cert"a".pem"; print >out}'
for cert in *.pem; do 
        newname=$(openssl x509 -noout -subject -in $cert | sed -nE 's/.*CN ?= ?(.*)/\1/; s/[ ,.*]/_/g; s/__/_/g; s/_-_/-/; s/^_//g;p' | tr '[:upper:]' '[:lower:]').pem
        echo "${newname}"; mv "${cert}" "${newname}" 
done
```

The certificates will be output to the working directory.  The certificate with the filename `Starfield Services Root Certificate Authority - G2.pem` is the root CA that should be uploaded to the controller.

## Adding Certificates
To add a certificate, go to the controller's IP address (which can be obtained from the OLED), then click Certificates.  Choose the root CA and click Upload.


> [!IMPORTANT]  
> Storage space on the config partition is very limited.  Only upload the root CA's required for your operation.

## Updating and Deleting Certificates
OTA configurations are not checked to ensure that a certificate continues to exist when you delete a certificate.  The [OTA Update Service](ota_updates.md) should be checked to ensure that the required certificate (if defined) still exists, or is configured to the updated certificate.

Configurations cannot be updated, only deleted and changes saved.