@ECHO OFF

REM ##########################################################################
REM customized by Hongbo
REM copyright
SET copyright="Darktalker"
REM project name
SET project_name="YUI"
REM project url
SET project_url=""
REM Set project home
SET project_home=F:\website\yuidoc

REM The location of your yuidoc install
SET yuidoc_home=F:\website\yuidoc\yui-yuidoc-c7395c6

REM The location of the files to parse.  Parses subdirectories, but will fail if
REM there are duplicate file names in these directories.  You can specify multiple
REM source trees:
REM      SET parser_in="c:\home\www\yahoo.dev\src\js c:\home\www\Event.dev\src"
REM SET parser_in="%project_home%\nengine\application %project_home%\nengine\config %project_home%\nengine\helpers %project_home%\nengine\modules %project_home%\nengine\templates %project_home%\nengine\util %project_home%\nengine\system\application %project_home%\nengine\resources\plusui"
SET parser_in=%project_home%\yui_3.2.0\yui\build

REM Customized by Hongbo
REM set files type to be parsed
SET files_ext=".js,.php"
REM The location to output the parser data.  This output is a file containing a 
REM json string, and copies of the parsed files.
SET parser_out=%project_home%\yuidoc\api_parser

REM The directory to put the html file outputted by the generator
SET generator_out=%project_home%\yuidoc\api_test

REM The location of the template files.  Any subdirectories here will be copied
REM verbatim to the destination directory.
SET template=%project_home%\yuidoc\themes\darktalker
REM SET template=%yuidoc_home%\template

REM The project version that will be displayed in the documentation.
SET version="2.0.0"

REM The version of YUI the project uses.
SET yuiversion="2"

DEL /s/q/f api_parser\*
DEL /s/q/f api_test\*

python "%yuidoc_home%\bin\yuidoc.py" "%parser_in%"  -e %files_ext%  -p "%parser_out%" -o "%generator_out%" -t "%template%" -v %version% -Y %yuiversion%  -m %project_name% -u %project_url% -C %copyright% -s
