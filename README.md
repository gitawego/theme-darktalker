It's a dojo based YUIDOC Theme.
1. point template option to darktalker to use this theme. make sure to change the dojotoolkit location in main.tmpl
2. if you wanna translate to another language, create two js files:base.js and template.js in theme/darktalker/assets/darktalker/nls/[your_language_folder]/.
the language folder name must respect the i18n naming convention.

for class
@class
@access
@final
@extends
@uses
@deprecated
@see
@description

for property
@property
@default
@deprecated

for method
@method
@access
@static
@private
@protected
@deprecated
@final
@return
@param
@chainable


for event
@event
@bubles [buble_to_event]
@chainable
@preventable [default_preventable_function]
@deprecated

for config
@config
@access [access_info]
@static [info]
@writeonce [info]
@final
@type [type]
@description
@deprecated
@default [default]

for module
@module
@submodule
@beta
@experimental
@requires [info]
@optional [info]

Example: http://darktalker.com/yuidoc
