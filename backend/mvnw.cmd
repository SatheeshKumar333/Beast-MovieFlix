@REM Maven Wrapper for Windows
@REM This script downloads and uses Maven automatically

@echo off
setlocal

set MAVEN_VERSION=3.9.6
set MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%

if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Maven not found locally. Downloading Maven %MAVEN_VERSION%...
    
    if not exist "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"
    
    powershell -Command "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%TEMP%\maven.zip' -UseBasicParsing"
    powershell -Command "Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%MAVEN_HOME%\..' -Force"
    del "%TEMP%\maven.zip"
    
    echo Maven installed successfully!
)

set PATH=%MAVEN_HOME%\bin;%PATH%
"%MAVEN_HOME%\bin\mvn.cmd" %*
