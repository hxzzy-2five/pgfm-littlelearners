# Little Learners - Preschool & Childcare Finder
Little Learners is a user-friendly website that helps parents and guardians search for preschool and childcare centres in Singapore.

The website uses official centre data from data.gov.sg and turns it into a simple searcable directory. Users can search by centre name, area or postal code filter by service model, vacancy, food option, language, view a selected centre on Google Maps and save centres into a shorlist.

This project fits the Digital Inclusion theme because it makes public childcare information easier to access, understand and compare. Users can interact with the information in a clearer and more practical way.

# Table Contents

- [UX]
- [Features]
- [Technologies Used]
- [Deployment]
- [Credits]

## UX

As a parent, I want to search for centres near my home so that I can quickly find suitable preschool or childcare options and check vacancy status so that I can forcus on centres that may have available places.

As a guardian, I want to filter by childcare or kindergarten so that I only see centres that match the type of service I need.

As a Muslim parent, I want to filter by food option so that I can find centres that offer no pork no lard meals.

As a busy parent, I want to save centres into a shorlist to compare them later without searching again and view a centre on Google Maps so that I can understand where it is located before contacting the centre.

Idea - https://www.figma.com/board/Aq3PiOEdg8nzg4mGPMkKmv/Programming-Fundamentals-Project-Organiser?node-id=0-1&p=f&t=Bj7uZDwGE6sQ3Od0-0

Design - https://www.figma.com/design/WRoG9TRK7WK0tDzyoBfjGs/pgfm---litter-learners?t=Bj7uZDwGE6sQ3Od0-0


## Features

- Search preschool and chilcare centres by centres, area, postal code, language, food or scheme.
- Filter centres by service model including ChildCare, Kindergarten and Development Support.
- Filter centres by current vacancy status, food option, second language offered.
- Display service model codes as full wording for easeier understanding.
- View selected centre locations in a wide embedded Google Map.
- Open selectted centres directly in Google Maps.
- View centre details in a popup dialog.
- Save centres into a shorlist using browser localStorage.
- Responvise layout for desktop and mobile screens.
- Loading and fallback messages for better user feedback.

## Technologies Used
- HTML: Used to structure the website content and sections.
- CSS: Used to create the minimalist theme, responsive layout and visual styling.
- Javascript: Used for fetching data, filtering results, update the DOM, showing details and saving centres.
- data.gov.sg API: Used to retrieve official ECDA Listing of Centres data.
- Google Maps Embed: Used to show the selected centre location on a map.
- localStorage: Used to store saved centres in the user's browser.

## Deployment

This project can be deployed using GitHub Pages because it is a static front-end website.

Branch structure:

- The main branch contains the stable version used for deployment.
- Future development can be done in a dev branch before merging back into main.

## Credits

Content: Centre information is from the Early Childhood Development Agency Listing of Centres dataset on data.gov.sg.
- This project concept is based on improving access to preschool and childcare information for parents and guardians.

Link to website - https://hxzzy-2five.github.io/pgfm-littlelearners/
