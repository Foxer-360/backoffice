# BackOffice

Core application called BackOffice used to create website projects and manage content using Composer.

## Git Large File Storage (Git LFS)

This repository uses **Git LFS**, to get more information about Git LFS, please visit [this website](https://git-lfs.github.com/). Git LFS is a plugin to git package, so you need to install this before you start using this repository.
This extension has a benefit with `non-code` large files like images, archives, etc. So if you add some file of this type into this repository, please make sure that this file is **tracked** by Git LFS. To show tracked files, you can use this command

`git lfs track`

You can tract files directly, or just files with some extension or files in some folder. For example if you want to track images with `.png` extension, you can do that by this command

`git lfs track *.png`
