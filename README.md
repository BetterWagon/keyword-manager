> [!WARNING]  
> This document is currently out of date

# Keyword Manager - A Plugin for BetterBoxx

This plugin allows you to manage keywords for your bot. You can add, update, and remove keywords.

# Installation

Clone this repository to your `plugins` folder in BetterBoxx. Then, restart BetterBoxx to load the plugin.

# Usage

To use the Keyword Manager plugin for BetterBoxx, follow these steps:

1. **Adding a Keyword:**
   To add a new keyword along with its content and category, use the command `/add keyword::content::category`. If the category is not specified, it will default to "unsorted".

2. **Editing a Keyword:**
   To edit an existing keyword's content or category, use the command `/edit keyword::newContent::newCategory`. If the category is not specified, it will default to "unsorted".

3. **Removing a Keyword:**
   To remove a keyword, use the command `/remove keyword`.

4. **Listing Keywords:**
   To list all keywords along with their categories, use the command `/list`.

Remember to restart BetterBoxx after making any changes to keywords.
