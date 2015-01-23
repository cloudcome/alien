/*global env: true */
var template = require('jsdoc/template'),
    fs = require('jsdoc/fs'),
    path = require('jsdoc/path'),
    taffy = require('taffydb').taffy,
    handle = require('jsdoc/util/error').handle,
    helper = require('jsdoc/util/templateHelper'),
    htmlsafe = helper.htmlsafe,
    linkto = helper.linkto,
    resolveAuthorLinks = helper.resolveAuthorLinks,
    scopeToPunc = helper.scopeToPunc,
    hasOwnProp = Object.prototype.hasOwnProperty,
    data,
    view,
    outdir = env.opts.destination;


function find(spec) {
    return helper.find(data, spec);
}

function tutoriallink(tutorial) {
    return helper.toTutorial(tutorial, null, { tag: 'em', classname: 'disabled', prefix: 'Tutorial: ' });
}

function getAncestorLinks(doclet) {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
    if ( !/^(#.+)/.test(hash) ) { return hash; }

    var url = helper.createLink(doclet);

    url = url.replace(/(#.+|$)/, hash);
    return '<a href="' + url + '">' + hash + '</a>';
}

function needsSignature(doclet) {
    var needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (var i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

function addSignatureParams(f) {
    var params = helper.getSignatureParams(f, 'optional');

    f.signature = (f.signature || '') + '('+params.join(', ')+')';
}

function addSignatureReturns(f) {
    var returnTypes = helper.getSignatureReturns(f);

    f.signature = '<span class="signature">'+(f.signature || '') + '</span>' + '<span class="type-signature">'+(returnTypes.length? ' &rarr; {'+returnTypes.join('|')+'}' : '')+'</span>';
}

function addSignatureTypes(f) {
    var types = helper.getSignatureTypes(f);

    f.signature = (f.signature || '') //+ '<span class="type-signature">'+(types.length? ' :'+types.join('|') : '')+'</span>';
}

function addAttribs(f) {
    var attribs = helper.getAttribs(f);

    f.attribs = '<span class="type-signature">'+htmlsafe(attribs.length? '<'+attribs.join(', ')+'> ' : '')+'</span>';
}

function shortenPaths(files, commonPrefix) {
    // always use forward slashes
    var regexp = new RegExp('\\\\', 'g');

    Object.keys(files).forEach(function(file) {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            .replace(regexp, '/');
    });

    return files;
}

function resolveSourcePath(filepath) {
    return path.resolve(process.cwd(), filepath);
}

function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return;
    }

    var filepath = doclet.meta.path && doclet.meta.path !== 'null' ?
        doclet.meta.path + '/' + doclet.meta.filename :
        doclet.meta.filename;

    return filepath;
}

function generate(title, docs, filename, resolveLinks) {
    resolveLinks = resolveLinks === false ? false : true;

    var docData = {
        title: title,
        docs: docs
    };

    var outpath = path.join(outdir, filename),
        html = view.render('container.tmpl', docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');
}

function generateSourceFiles(sourceFiles) {
    Object.keys(sourceFiles).forEach(function(file) {
        var source;
        // links are keyed to the shortened path in each doclet's `meta.filename` property
        var sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);
        helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

        try {
            source = {
                kind: 'source',
                code: helper.htmlsafe( fs.readFileSync(sourceFiles[file].resolved, 'utf8') ),
            };
        }
        catch(e) {
            handle(e);
        }

        generate('Source: ' + sourceFiles[file].shortened, [source], sourceOutfile,
            false);
    });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    var symbols = {};

    // build a lookup table
    doclets.forEach(function(symbol) {
        symbols[symbol.longname] = symbol;
    });

    return modules.map(function(module) {
        if (symbols[module.longname]) {
            module.module = symbols[module.longname];
            module.module.name = module.module.name.replace('module:', 'require("') + '")';
        }
    });
}


/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {//console.log('buildNav(members); members = ', members);
    var nav = [],
        seen = {},
        hasClassList = false,
        classNav = '',
        globalNav = '';

    // note that this nav is wrapped in a <nav> and <div class="nav-inner">
    nav.push('<ul class="nav navbar-nav">');

    if (members.modules.length) {
        nav.push('<li class="dropdown">');
        nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Modules<b class="caret"></b></a>');
        nav.push(   '<ul class="dropdown-menu">');

        members.modules.forEach(function(m) {
            if ( !hasOwnProp.call(seen, m.longname) ) {
                nav.push('<li>' + linkto(m.longname, m.name) + '</li>');
            }
            seen[m.longname] = true;
        });

        nav.push(   '</ul>');
        nav.push('</li>');
    }

    if (members.externals.length) {
        members.externals.sort(sortIgnoringQuotes);

        nav.push('<li class="dropdown">');
        nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Externals<b class="caret"></b></a>');
        nav.push(   '<ul class="dropdown-menu">');
        members.externals.forEach(function(e) {
            if ( !hasOwnProp.call(seen, e.longname) ) {
                nav.push('<li>' + linkto( e.longname, killQuotes(e.name) ) + '</li>');
            }
            seen[e.longname] = true;
        });

        nav.push(   '</ul>');
        nav.push('</li>');
    }

    if (members.classes.length) {
        members.classes.sort(sortIgnoringQuotes);

        members.classes.forEach(function(c) {
            if ( !hasOwnProp.call(seen, c.longname) ) {
                classNav += '<li>'+linkto(c.longname, killQuotes(c.name))+'</li>';
            }
            seen[c.longname] = true;
        });

        if (classNav !== '') {
            nav.push('<li class="dropdown">');
            nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Classes<b class="caret"></b></a>');
            nav.push(   '<ul class="dropdown-menu">');
            nav.push(       classNav);
            nav.push(   '</ul>');
            nav.push('</li>');
        }
    }

    if (members.events.length) {
        members.events.sort(sortIgnoringQuotes);

        nav.push('<li class="dropdown">');
        nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Events<b class="caret"></b></a>');
        nav.push(   '<ul class="dropdown-menu">');

        members.events.forEach(function(e) {
            if ( !hasOwnProp.call(seen, e.longname) ) {
                nav.push('<li>' + linkto(e.longname, killQuotes(e.memberof) + '.' + killQuotes(e.name)) + '</li>');
            }
            seen[e.longname] = true;
        });

        nav.push(   '</ul>');
        nav.push('</li>');
    }

    if (members.namespaces.length) {
        nav.push('<li class="dropdown">');
        nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Namespaces<b class="caret"></b></a>');
        nav.push(   '<ul class="dropdown-menu">');

        members.namespaces.forEach(function(n) {
            if ( !hasOwnProp.call(seen, n.longname) ) {
                nav.push('<li>' + linkto(n.longname, n.longname) + '</li>');
            }
            seen[n.longname] = true;
        });

        nav.push(   '</ul>');
        nav.push('</li>');
    }

    if (members.mixins.length) {
        nav.push('<li class="dropdown">');
        nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Mixins<b class="caret"></b></a>');
        nav.push(   '<ul class="dropdown-menu">');

        members.mixins.forEach(function(m) {
            if ( !hasOwnProp.call(seen, m.longname) ) {
                nav.push('<li>' + linkto(m.longname, m.name) + '</li>');
            }
            seen[m.longname] = true;
        });

        nav.push(   '</ul>');
        nav.push('</li>');
    }

    if (members.tutorials.length) {
        nav.push('<li class="dropdown">');
        nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Tutorials<b class="caret"></b></a>');
        nav.push(   '<ul class="dropdown-menu">');

        members.tutorials.forEach(function(t) {
            nav.push('<li>' + tutoriallink(t.name) + '</li>');
        });

        nav.push(   '</ul>');
        nav.push('</li>');
    }

    if (members.globals.length) {
        var memberData = []
            , methodData = []
            , eventData = []
            , otherData = []
            , depClass = ''
            ;

        members.globals.forEach(function(g) {//console.log('GLOBAL: ', g, "\n\n\n");
            if ( g.kind !== 'typedef' && !hasOwnProp.call(seen, g.longname) ) {
                switch (g.kind) {
                    case 'member':
                        depClass = (g.deprecated) ? ' class="deprecated"' : '';
                        memberData.push('<li' + depClass + '>' + linkto(g.longname, g.name) + '</li>');
                        break;

                    case 'function':
                        depClass = (g.deprecated) ? ' class="deprecated"' : '';
                        methodData.push('<li' + depClass + '>' + linkto(g.longname, g.name) + '</li>');
                        break;

                    case 'event':
                        eventData.push('<li>' + linkto(g.longname, g.name) + '</li>');
                        break;

                    default:
                        depClass = (g.deprecated) ? ' class="deprecated"' : '';
                        otherData.push('<li' + depClass + '>' + linkto(g.longname, g.name) + '</li>');
                        break;
                }
                // globalNav += '<li>' + linkto(g.longname, g.name) + '</li>';
            }
            depClass = '';
            seen[g.longname] = true;
        });

        globalNav = true;


        if (!globalNav) {
            // turn the heading into a link so you can actually get to the global page
            //nav.push('<li>' + linkto('global', 'Global') + '</li>');
        } else {
            nav.push('<li class="dropdown">');
            nav.push(   '<a href="#" class="dropdown-toggle" data-toggle="dropdown">Globals<b class="caret"></b></a>');
            nav.push(   '<ul class="dropdown-menu">');
            // nav.push(       globalNav);

            if (otherData.length) {
                // nav.push('<li class="nav-header">Other</li>');
                nav.push(otherData.join("\n"));
            }
            if (memberData.length) {
                nav.push('<li class="nav-header">Members</li>');
                nav.push(memberData.join("\n"));
            }
            if (methodData.length) {
                nav.push('<li class="nav-header">Methods</li>');
                nav.push(methodData.join("\n"));
            }
            if (eventData.length) {
                nav.push('<li class="nav-header">Events</li>');
                nav.push(eventData.join("\n"));
            }

            nav.push(   '</ul>');
            nav.push('</li>');
        }

    }

    nav.push('</ul>');

    return nav.join("\n");
}


/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
    data = taffyData;

    var conf = env.conf.templates || {};
    conf['default'] = conf['default'] || {};

    var templatePath = opts.template;
    view = new template.Template(templatePath + '/tmpl');

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
    // doesn't try to hand them out later
    var indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    var globalUrl = helper.getUniqueFilename('global');
    helper.registerLink('global', globalUrl);

    // set up templating
    view.layout = 'layout.tmpl';

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    var sourceFiles = {};
    var sourceFilePaths = [];

    data().each(function(doclet) {
        doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(function(example) {
                var caption, code;

                if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                    caption = RegExp.$1;
                    code    = RegExp.$3;
                }

                return {
                    caption: caption || '',
                    code: code || example
                };
            });
        }
        if (doclet.see) {
            doclet.see.forEach(function(seeItem, i) {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }

        // build a list of source files
        var sourcePath;
        var resolvedSourcePath;
        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            resolvedSourcePath = resolveSourcePath(sourcePath);
            sourceFiles[sourcePath] = {
                resolved: resolvedSourcePath,
                shortened: null
            };
            sourceFilePaths.push(resolvedSourcePath);
        }
    });

    // update outdir if necessary, then create outdir
    var packageInfo = ( find({kind: 'package'}) || [] ) [0];
    if (packageInfo && packageInfo.name) {
        outdir = path.join(outdir, packageInfo.name, packageInfo.version);
    }
    fs.mkPath(outdir);

    // copy the template's static files to outdir
    var fromDir = path.join(templatePath, 'static');
    var staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(function(fileName) {
        var toDir = fs.toDir( fileName.replace(fromDir, outdir) );
        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    // copy user-specified static files to outdir
    var staticFilePaths;
    var staticFileFilter;
    var staticFileScanner;
    if (conf['default'].staticFiles) {
        staticFilePaths = conf['default'].staticFiles.paths || [];
        staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf['default'].staticFiles);
        staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

        staticFilePaths.forEach(function(filePath) {
            var extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(function(fileName) {
                var sourcePath = fs.statSync(filePath).isDirectory() ? filePath :
                    path.dirname(filePath);
                var toDir = fs.toDir( fileName.replace(sourcePath, outdir) );
                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    if (sourceFilePaths.length) {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }
    // sets the meta.filename property on each doclet
    data().each(function(doclet) {
        var url = helper.createLink(doclet);
        helper.registerLink(doclet.longname, url);

        // replace the filename with a shortened version of the full path
        var docletPath;
        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.filename = docletPath;
            }
        }
    });

    // sets the id property for each doclet
    data().each(function(doclet) {
        var url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated (set sign types and attribs)
    data().each(function(doclet) {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    // inherited members/methods dont show up by default in the file which extends
    // their parent class. let's rectify that.
    //console.log(data()); //returns a taffy object with taffy functions
    data().each(function(doclet) {
        var docletMembersMethodsObj, parentMembersMethodsObj;
        // console.log('data().each() --',doclet.kind,':',doclet.longname);

        if (doclet.kind == 'class' && doclet.augments) {
            // console.log('>>> CLASS:', doclet.name);
            // console.log('>>  AUGMENTS:', doclet.augments);

            docletMembersMethodsObj = getMembersMethodsObj(doclet);
            // console.log('>>> docletMembersMethodsObj', docletMembersMethodsObj);

            doclet.augments.forEach(function(aug) {
                // console.log('checking:', aug);
                // console.log('>>>>> parent Class', aug);
                parentMembersMethodsObj = getMembersMethodsObj(find({ kind: 'class', longname: aug })[0]);
                // console.log('>>>>>>> parentMembersMethodsObj', parentMembersMethodsObj);

                // find overridden members/methods and update the db
                // console.log('  flagOverrides for methods');
                flagOverrides(docletMembersMethodsObj.methods, parentMembersMethodsObj.methods);
                // console.log('  flagOverrides for members');
                flagOverrides(docletMembersMethodsObj.members, parentMembersMethodsObj.members);

                // find inherited members/methods and update the db
                // addInherited(docletMembersMethodsObj.members, parentMembersMethodsObj.members, doclet.longname);
                // addInherited(docletMembersMethodsObj.methods, parentMembersMethodsObj.methods, doclet.longname);
            });
        }
    });
    // end inheritance enhancement

    var members = helper.getMembers(data);
    members.tutorials = tutorials.children;

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.tutoriallink = tutoriallink;
    view.htmlsafe = htmlsafe;
    // custom
    view.taffyResultsToObj = taffyResultsToObj;
    view.killQuotes = killQuotes;
    // view.findInherited = findInherited;
    // view.findOverrides = findOverrides;

    // once for all
    view.nav = buildNav(members);
    attachModuleSymbols( find({ kind: ['class', 'function'], longname: {left: 'module:'} }),
        members.modules );
    // only output pretty-printed source files if requested; do this before generating any other
    // pages, so the other pages can link to the source files
    if (conf['default'].outputSourceFiles) {
        generateSourceFiles(sourceFiles);
    }

    if (members.globals.length) { generate('Global', [{kind: 'globalobj'}], globalUrl); }

    // index page displays information from package.json and lists files
    var files = find({kind: 'file'}),
        packages = find({kind: 'package'});

    generate('Index',
        packages.concat(
            [{kind: 'mainpage', readme: opts.readme, longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'}]
        ).concat(files),
    indexUrl);

    // set up the lists that we'll use to generate pages
    /**
     *  These vars returns an object:
     *  { [Function]
     *  insert: [Function],
     *  merge: [Function],
     *  TAFFY: true,
     *  sort: [Function],
     *  settings: [Function],
     *  store: [Function] }
     */
    var classes = taffy(members.classes);
    var modules = taffy(members.modules);
    var namespaces = taffy(members.namespaces);
    var mixins = taffy(members.mixins);
    var externals = taffy(members.externals);

    Object.keys(helper.longnameToUrl).forEach(function(longname) {
        var myClasses = helper.find(classes, {longname: longname});
        if (myClasses.length) {
            generate('Class: ' + myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        }

        var myModules = helper.find(modules, {longname: longname});
        if (myModules.length) {
            generate('Module: ' + myModules[0].name, myModules, helper.longnameToUrl[longname]);
        }

        var myNamespaces = helper.find(namespaces, {longname: longname});
        if (myNamespaces.length) {
            generate('Namespace: ' + myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        }

        var myMixins = helper.find(mixins, {longname: longname});
        if (myMixins.length) {
            generate('Mixin: ' + myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        }

        var myExternals = helper.find(externals, {longname: longname});
        if (myExternals.length) {
            generate('External: ' + myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        }
    });

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, filename) {
        var tutorialData = {
            title: title,
            header: tutorial.title,
            content: tutorial.parse(),
            children: tutorial.children
        };

        var tutorialPath = path.join(outdir, filename),
            html = view.render('tutorial.tmpl', tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>

        fs.writeFileSync(tutorialPath, html, 'utf8');
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(function(child) {
            generateTutorial('Tutorial: ' + child.title, child, helper.tutorialToUrl(child.name));
            saveChildren(child);
        });
    }
    saveChildren(tutorials);
};



/**
 *  These are functions added on top of existing implementation.
 */

/**
 *  Take the results from a taffy query (via the find() function) and transform it
 *  into an object--keyed by name--which contains the original results (obj.<name>.cache)
 *  as well as the index in the original array (obj.<name>.index).
 *
 *  @param {array} results The taffy results.
 *
 *  @returns {object}
 */
function taffyResultsToObj(results) {
    var obj = {};

    if (results.forEach) {
        results.forEach(function(element, ndx) {
            obj[element.name] = {
                cache : element,
                index : ndx
            };
        });
    } else {
        console.error('Invalid param passed to taffyResultsToObj: ', results);
    }

    return obj;
}


/**
 *  @param {object} docObjs An object with members (or methods) with names as keys. A child class.
 *  @param {object} parentsObjs An object with members (or methods) with names as keys. A parent class.
 */
function flagOverrides(docObjs, parentObjs) {
    var mem;

    // console.log('- - function flagOverrides (traverse child doclets) - -');
    // console.log('CHILD keys: ', Object.keys(docObjs));
    // console.log('PARENT keys: ', Object.keys(parentObjs));
    // console.log(' ');

    for (mem in docObjs) {
        // if (mem.indexOf('postAjaxSuccess') > -1) console.log(docObjs[mem], '[[[ PARENT ]]]>', parentObjs);
        // console.log('    for', mem);
        // check to see if the method exists in the parent as long as it isnt inherited
        if (!docObjs[mem].cache.inherits && parentObjs[mem]) {
            // it does, so lets flag it in the doclet data as an object with useful properties
            // console.log('    found! id:', docObjs[mem].cache.___id);

            data(docObjs[mem].cache.___id).update({
                overrides: {
                    ___id   : parentObjs[mem].cache.___id,
                    id      : parentObjs[mem].cache.id,
                    name    : parentObjs[mem].cache.name,
                    longname: parentObjs[mem].cache.longname
                }
            });
            // console.log('  UPDATED DOCLET:', data(docObjs[mem].cache.___id).get());
        }
        // console.log('--------------------------------------------------');
    }
    //console.log(' ');
};


// expect doclet to be for a class
// see if that class extends another and, if so, grab that classes members and
// methods and return them each (as an array of doclets) in an object.
// { members: doclet[], methods: doclet[]}
// function addInherited(docObjs, parentObjs, docObjsClassLongName) {
//     var mem, docCopy;

//     // console.log('- - function addInherited (traverse parent doclets) - -');
//     // console.log('to:', docObjsClassLongName);

//     if (typeof docObjsClassLongName !== 'string' || docObjsClassLongName.length == 0) {
//         console.error(
//             '[ERROR] addInherited(docObjs, parentObjs, docObjsClassLongName):',
//             'param docObjsClassLongName must be the longname of a Class!'
//         );
//         return false;
//     }

//     // loop through each member in the wrapped taffy results object
//     for (mem in parentObjs) {
//         // console.log('    looking for', mem);

//         // check to see if the member exists in the child
//         if (!docObjs[mem]) {
//             // it doesn't, so lets add a record to make the doclet appear as if it was defined in the child
//             // console.log('    inherited! id:', parentObjs[mem].cache.___id);

//             // make a copy of the doclet since the original data may be reused elsewhere

//             docCopy = Object.clone(parentObjs[mem].cache);
//             // remove properties set by taffy internally
//             delete docCopy.___id;
//             delete docCopy.___s;

//             // remove the overrides property as we are inheriting, not overriding. this situation
//             // occurs when you have at least 3 "generations" of a class. (e.g. Granny > Mommy > Johnny)
//             docCopy.overrides && delete docCopy.overrides;

//             // add the inherited data
//             docCopy.inherited = {
//                     __id    : parentObjs[mem].cache.___id,
//                     longname: parentObjs[mem].cache.longname,
//                 };

//             // change some properties to make the doclet seem like it's more a part of the child
//             // might change this depending on how output looks/works
//             docCopy.memberof = docObjsClassLongName;
//             docCopy.longname = docObjsClassLongName + '#' + docCopy.name;

//             // console.log('data.insert =', data.insert);
//             data.insert(docCopy);

//             // console.log('  NEW DOCLET:', docCopy);
//         }

//         // console.log('--------------------------------------------------');
//     }
//     // console.log(' ');
// }


function getMembersMethodsObj(doclet) {
    return {
            members: taffyResultsToObj(find({ kind: 'member', memberof: doclet.longname })),
            methods: taffyResultsToObj(find({ kind: 'function', memberof: doclet.longname })),
        };
}

if (!Object.clone) {
    Object.clone = function(obj) {
        var newObj = {}, prop;
        if (typeof obj == 'object') {
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    newObj[prop] = obj[prop];
                }
            }
        }
        return newObj;
    }
}

// make sure that names with quotes order correctly. meant to be passed to Array.sort()
function sortIgnoringQuotes(docletA, docletB) {
    var docALong, docBLong, docAShort, docBshort;
    if (docletA.longname && docletB.longname) {
        docALong = docletA.longname.replace(/['"]/g, '').toLowerCase();
        docBLong = docletB.longname.replace(/['"]/g, '').toLowerCase();
        if (docALong < docBLong) {
            return -1;
        }
        if (docALong > docBLong) {
            return 1;
        }
    } else {
        docAShort = docletA.name.replace(/['"]/g, '').toLowerCase();
        docBShort = docletB.name.replace(/['"]/g, '').toLowerCase();
        if (docAShort < docBShort) {
            return -1;
        }
        if (docAShort > docBShort) {
            return 1;
        }
    }
    return 0;
}

function killQuotes(string) {
    return (typeof string === 'string')
                ? string.replace(/['"]/g, '')
                : null;
}
