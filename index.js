#!/usr/bin/env node --max_old_space_size=4096
const fs = require('fs');
const findInFiles = require('find-in-files');
const replace = require('replace-in-file');
const readline = require('readline');
const stream = require('stream');
const path = require("path");

const classesFile = 'classes.txt';
const artifactsFile = 'artifacts.txt';
const searchInFileTypes = '(.java|.js|.ts|.xml|.gradle)$';
let artifactsSuggestionsCount = 0;
let namespacesChangesCount = 0;

const excludeArtifactLines = [
    '//\tcompile \'com.android.support:recyclerview-v7:+\'',
    '//\timplementation \'com.android.support:recyclerview-v7:+\''];

function getClasses(inputFile) {
    return new Promise(function (resolve, reject) {
        const classesMaps = new Object();
        const instream = fs.createReadStream(path.resolve(__dirname, inputFile))
        const outstream = new (stream)();
        const rl = readline.createInterface(instream, outstream);

        rl.on('line', function (line) {
            var pair = line.split(",");
            classesMaps[pair[0]] = pair[1];
        });

        rl.on('close', function (line) {
            return resolve(classesMaps);
        });
    });
}

function migrateAndroidXNamespaces(classes, pluginDir) {
    return new Promise(function (resolveOuter) {
        var keys = Object.keys(classes);
        var endToIndex = keys.length;//1708 android.support.v4.view.ViewCompat
        for (let i = 0, p = Promise.resolve(); i < endToIndex; i++) {
            p = p.then(_ => new Promise(resolveInner => {
                const suportNamespace = keys[i];
                const androidXnamespace = classes[suportNamespace];
                const suportNamespaceGlobal = suportNamespace.replace("android", "globalAndroid");

                const searchRegEx = `${suportNamespace}|${suportNamespaceGlobal}`;

                findInFiles.find(searchRegEx, pluginDir, searchInFileTypes)//.gradle
                    .then(function (results) {
                        const filesWithNamespace = Object.keys(results);

                        const options = {
                            files: filesWithNamespace,
                            from: new RegExp(searchRegEx, 'g'),
                            to: androidXnamespace,
                        };

                        replace(options)
                            .then(changes => {
                                if (changes.length > 0) {
                                    namespacesChangesCount++;
                                    console.log(`\n${suportNamespace} -> ${androidXnamespace} in:`);
                                    console.log('---------------------------------------------');
                                    changes.forEach(file => {
                                        console.log(file);
                                    });
                                    console.log('---------------------------------------------');
                                }

                                if (i == endToIndex - 1) {
                                    resolveInner();
                                    return resolveOuter(namespacesChangesCount);
                                }

                                resolveInner();
                            })
                            .catch(error => {
                                console.error('Error occurred:', error);
                                resolveInner();
                            });

                    }).catch((error) => {
                        console.log(error);
                        resolveInner();
                    });
            }));
        }
    });
}


function suggestAndroidXArtifacts(artifacts, pluginDir) {
    return new Promise(function (resolveOuter) {
        const keys = Object.keys(artifacts);
        const endToIndex = keys.length;
        const filesToChange = [];
        for (let i = 0, p = Promise.resolve(); i < endToIndex; i++) {
            p = p.then(_ => new Promise(resolveInner => {
                const suportArtifact = keys[i];
                const androidXartifact = artifacts[suportArtifact];

                findInFiles.find(suportArtifact, pluginDir, searchInFileTypes)
                    .then(function (results) {
                        const filesWithNamespace = Object.keys(results);

                        for (let index = 0; index < filesWithNamespace.length; index++) {
                            const resultFile = filesWithNamespace[index];
                            const resultObject = results[resultFile];

                            if (resultObject.line.length === 1 && excludeArtifactLines.indexOf(resultObject.line[0]) === 0) {
                                continue;
                            }
                            else {
                                artifactsSuggestionsCount++;
                                const changeLine = `Change:${suportArtifact} -> ${androidXartifact}`;

                                if (filesToChange[resultFile]) {
                                    filesToChange[resultFile].changes.push(changeLine);
                                } else {
                                    filesToChange[resultFile] = {
                                        filePath: path.resolve(resultFile),
                                        changes: [changeLine]
                                    }
                                }
                            }
                        };

                        if (i == endToIndex - 1) {
                            resolveInner();
                            return resolveOuter({
                                artifactsSuggestionsCount: artifactsSuggestionsCount,
                                filesToChange: filesToChange
                            });
                        }

                        resolveInner();
                    }).catch((error) => {
                        console.log(error);
                        resolveInner();
                    });
            }));
        }
    });
}

///RUN WITH: npm run migrate nativescript-ui-listview
let pluginDir = process.argv[2];
pluginDir = path.resolve(pluginDir);

console.log("Search and Replace in:" + pluginDir);

function namspaces() {
    return new Promise(function (resolve) {
        console.log("Migrating namespaces. Please wait this may take a few minutes");
        const getClassesPromise = getClasses(classesFile);
        getClassesPromise.then(function (classes) {
            migrateAndroidXNamespaces(classes, pluginDir).then((namespacesChangesCount) => {
                if (namespacesChangesCount) {
                    console.log(`\nChanges successfully applied! Please review all changed files (under source control)`);
                } else {
                    console.log(`\nNo namespaces to change found`);
                }

                return resolve();
            })
        });
    });
}

function artifacts() {
    return new Promise(function (resolve) {
        console.log("Suggesting artifacts changes. Please wait this may take a few minutes");
        const getClassesPromise = getClasses(artifactsFile);
        getClassesPromise.then(function (artifacts) {
            suggestAndroidXArtifacts(artifacts, pluginDir).then((options) => {
                const artifactsSuggestionsCount = options.artifactsSuggestionsCount;
                const filesToChange = options.filesToChange;

                if (artifactsSuggestionsCount) {
                    const filesToChangeKeys = Object.keys(filesToChange);
                    filesToChangeKeys.forEach(file => {
                        console.log("Suggested changes:");
                        console.log('---------------------------------------------');
                        console.log("File:" + filesToChange[file].filePath);
                        filesToChange[file].changes.forEach(changeLine => {
                            console.log(changeLine);
                        });
                        console.log('---------------------------------------------\n');
                    });

                    console.log(`Found ${artifactsSuggestionsCount} artifacts change suggestions`);
                } else {
                    console.log(`No artifacts change suggestions found`);
                }

                return resolve();
            });
        });
    });
}

namspaces().then(() => {
    artifacts();
});
