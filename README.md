# **PowerRenameExt**

PowerRenameExt is a cross-platform bulk renaming tool conceived as a powered-up version of Microsoft's [PowerRename](https://learn.microsoft.com/en-us/windows/powertoys/powerrename) tool (part of the [PowerToys](https://learn.microsoft.com/en-us/windows/powertoys) suite), with extra added functionality such as the ability to use functions in order to compute the replacements, which in turn enables the user to process more advanced file renaming and indexing operations.

It features:

- Regular expression replacement.
- Match one or all occurrences.
- Case sensitive search.
- Apply to filenames, extensions or both.
- Include/Exclude files, folders and subfolders.
- Use a function to process a replacement for a given search term.
- Use a function to process a replacement instead of a search term (global function).
- Dark/Light theme as stablished in the system settings.

### Standard replacement

![standard_replacement](https://user-images.githubusercontent.com/1613216/228226863-b538d7b2-6e0b-433a-b21c-eb4820a7c498.gif)

### Regular expression replacement

![regular_Expressions](https://user-images.githubusercontent.com/1613216/228227405-6923eafa-9c19-4f98-a21a-6c170280c537.gif)

### Replacement function

![replacement_function](https://user-images.githubusercontent.com/1613216/228227445-610beda2-dd01-47f0-b81b-6bdda638bf4c.gif)
_the replacement function will receive the same arguments that you should expect from the [JavaScript replace function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_the_replacement)_

### Global function

![global_function](https://user-images.githubusercontent.com/1613216/228227476-0cfe254a-3286-4620-ac67-55bb827d1bc2.gif)
_the global function will receive the entire entry name as search (including the extension for files), and will use whatever the function returns as replacement_

Both function features will receive a set of extra information through the `this` object. In particular they will receive:

- `globalIndex`: The global index of the current item across the entire processing.
- `fileInFolderIndex`: The index of the current entry within its containing folder, as found when the directory was read. Note that only files will receive this type of index.
- `isFolder`: Indicates whether the current entry is a folder or not.
- `stats`: The `Stats` object of the current entry as returned by the [node.js `stat` function](https://nodejs.org/api/fs.html#fsstatpath-options-callback). For example, you can use `this.stats.birthtime`.

## How to use

Once built and packaged, the final executable will accept a list of space-separated arguments that will use as the source paths to recursively process. These source paths can be either files or folders:

```bash
 .\PowerRenameExt.exe "E:\test\test1.txt" "E:\test\test2.js" "E:\test\test3.pdf" "E:\test\test_folder"
```

On Windows, you can also open one file or folder (recursively) using the file explorer's context menu integration, by right-clicking on the desired file or folder and choosing the option _"Open with PowerRenameExt"_.

Note than on `Windows 11`, you'll need to select the _"Show more options"_ option first.

## Install

Clone the repo and install dependencies:

```bash
git clone https://github.com/DiegoBM/power-rename-ext.git

cd power-rename-ext

npm install
```

## Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

### How to test in development

During development, the interface will try to load and process any paths included in an environment variable named `TESTPATHS` defined in a `.env` file at the root folder of the project.

These paths need to be defined in a comma-separated list:

```
# .env

TESTPATHS=E:\test\test1.txt,E:\test\test2.js,E:\test\test3.pdf,E:\test\test_folder
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

## Maintainer

[Diego de Blas Mateo](https://github.com/DiegoBM)

## Notes

Being an Electron application, and using only platform agnostic file-system operations, the final result should work accross all desktop platforms, but please bear in mind that it has only been tested in Windows, since I don't own a Mac to test on.

## Credits

Created using the fantastic [Electron React Boilerplate](https://github.com/electron-react-boilerplate) as base.

## License

MIT © [PowerRenameExt](https://github.com/DiegoBM/power-rename-ext)
