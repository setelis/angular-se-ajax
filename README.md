# What is this

Simple Ajax Helpers used in many Setelis projects. You can see very basic demo here: http://setelis.github.io/angular-se-ajax/demo/

 - Show loader when requests are made
 - Prevent double click when POST/PUT/DELETE requests are made
 - Show error notifications if request fails

 - TODO - add more info

# Install:

 - Add library to your project: ```bower install angular-se-ajax --save```
 - Add module to your project: ```angular.module("DemoApp", ["seAjax"])...```
 - Add image for the loader:
```css
.se-loading {
   background: url('https://i1.wp.com/cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif') center center no-repeat;
   min-height: 190px;
   min-width: 100px;
}
```
 - Add the directive on parent element:
```js
 <div class="panel-body" data-se-loading="demoCtrl.post">
    <div class="form-group">
    ...
    </div>
</div>
```
 - Prevent double click - on not GET methods - add css:
 ```css
 /* dialogs without title, probably waiters */
 .no-titlebar .ui-dialog-titlebar {
     display: none;
 }
 .no-titlebar.ui-dialog.ui-widget.ui-widget-content {
    border: 0px;
    background: url('https://i1.wp.com/cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif') center center no-repeat;
    min-height: 190px;
    min-width: 100px;
 }
 ```

 - TODO

# Dependencies:
 - jquery ui dialog - prevent double click
 - restangular - it uses restangular mainly
 - angular-se-notifications - ajax errors
 - jquery - jquery-ui
 - bootstrap, optional - notification baloon
 - ui router - uses state name for ajax display request error
 - angular translate - translate ajax errors
 - lodash - restangular

# For developers:
# Setup

Developer should have *w3c validator*, *git*, *npm*, *grunt* and *bower* installed.
These command should be invoked:
 - ```webapp$ npm install```
 - ```webapp$ bower update```

Then app can be deployed in any web server.

# Working with GIT
 - **MERGE** should **not** be used! Only **REBASE** (```git pull --rebase```)
 - ```grunt```
   - this will run tests/validators
 - ```git add .```
 - ```git commit -m "TRAC_NUMBER TRAC_DESCRIPTION - more information (if needed)"```
 - ```git pull --rebase```
 - ```grunt```
 - ```git push```

# Environment variables

To use grunt with the project following environment variables **MUST** be set (e.g. in *~/.profile*):
 - ```export SEAJAX_W3C_LOCAL_URL=http://10.20.30.140:9980/w3c-validator/check```

Where local w3c validator is installed on http://10.20.30.140:9980/w3c-validator/check (outside Setelis LAN - w3c validator should be installed manually - see the section *Installing W3C Validator*)

# Development cycle
 - create/find issue
 - ```git pull --rebase```
 - ```grunt watch```
 - implement the selected issue
 - ```grunt```
   - this will run tests/validators
 - ```git add .```
 - ```git commit -m "NUMBER TRAC_DESCRIPTION - more information (if needed)"```
 - ```git pull --rebase```
 - ```grunt```
 - ```git push```
 - *again*


# grunt
There are several commands:
 - ```grunt```
   - validates (tests, static analyzers, html validator) the project
 - ```grunt build```
   - builds the project (see the *dist/* folder)


# Installing W3C Validator
w3c free online validator will block your IP if you try to validate project HTMLs many times (this happens usually when modifying html files when grunt watch is started).

How to install w3c validator + HTML5 validator (validator.nu):

**Ubuntu 13.10+**: there are some issues, see http://askubuntu.com/questions/471523/install-wc3-markup-validator-locally


Short version:
```sh
sudo mkdir /etc/apache2/conf.d
sudo apt-get install w3c-markup-validator libapache2-mod-perl2
sudo ln -s /etc/w3c/httpd.conf /etc/apache2/conf-enabled/w3c-markup-validator.conf
sudo gedit /etc/apache2/conf-available/serve-cgi-bin.conf
```
```
<IfModule mod_alias.c>
    <IfModule mod_cgi.c>
        Define ENABLE_USR_LIB_CGI_BIN
    </IfModule>

    <IfModule mod_cgid.c>
        Define ENABLE_USR_LIB_CGI_BIN
    </IfModule>

    <IfModule mod_perl.c>
        Define ENABLE_USR_LIB_CGI_BIN
    </IfModule>

    <IfDefine ENABLE_USR_LIB_CGI_BIN>
        ScriptAlias /cgi-bin/ /usr/lib/cgi-bin/
        <Directory "/usr/lib/cgi-bin">
            AllowOverride None
            Options +ExecCGI -MultiViews +SymLinksIfOwnerMatch
            Require all granted
        </Directory>
    </IfDefine>
</IfModule>
# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
 ```

Then follow the steps that haven't already been taken in http://blog.simplytestable.com/installing-the-w3c-html-validator-with-html5-support-on-ubuntu/

These should be changed in original tutorial:
 - HTML5 = http://localhost:8888
 - java should be version 7!


Restart apache when done:

```sudo service apache2 restart ```

For HTML validator you can follow these instructions: http://validator.github.io/validator/#build-instructions
