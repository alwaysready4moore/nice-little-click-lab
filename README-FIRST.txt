NICE LITTLE CLICK LAB — PDF FIT + OPTIONAL CLICK PATCH

Copy these folders into:
E:\Dev\nice-little-click-lab

- app
- lib

Choose “Replace the files in the destination.”

This patch:
- embeds only MailmanRegular.otf and Mimosa.woff2 in exported PDFs
- keeps every crossword grid inside safe letter-page margins
- centers wide and tall grids automatically
- uses Mimosa for grid letters, numbers, clues, labels, and footer text
- uses MailmanRegular only for the personalized puzzle title
- adds an “Include Click on the answer-key page” checkout option
- uses the existing public/images/click/click-awake-receipt.png asset

Then restart:
Ctrl+C
npm run dev

Complete a new sandbox checkout and download a new PDF.
Old PDF files will not change.
