# Firebase Auth for Vite

run-pix.web.app


## Reference

### FireStore

## Root

* config

## Races

* Date: ISODate
* Location,
* Name,
* Course: ["5","10"]
* Waypoints: [venue,general,start,end,5k,10k]   
    Waypoints can be common to both routes

    **venue, general skipped for timing**
* bibPattern
* photoStatus: "published" #string
* coverPage: imagePath in /processed/RaceId/images
* status: [open|closed|archived] # used for timing
* linkFeedback
* linkOrg
* linkPhotos
* linkReg
* linkResults
* timestamp:
    * modify
    * start
    * result
* processing
    * scanImages
    * scanVideos
* certificate
    * finisherCertificate: Google Slides Document ID

## users 

* roles
    * admin : race_regex
    * director : race_regex
    * photos : race_regex
    * timing : race_regex
* 

* email id
### Hierarchy
* Event/Race : My Choice  
    * Course/Distance : 10k
        * WPT : START,END
    * Bib

photos: Event, WPT

* security domains:
    * org [admin: (create,delete,change) for any events]  {e.g. PCMCrunners}
        * event [admin: (create,delete,change (release results)),timing_team: enter/edit timing,pic: upload/edit pics,]
* security check:
    * role: org, event
        * object: type:id
        * activity: create, update, view
* users
    admin: orgs, events
    timing: orgs, events
    photos: orgs, events

### Paths
 NOTE
 location to be inserted
 email @ replaced by $

* Storage: /uploads/race/time~wpt~user~loc~file    # uploaded images
    * no time means only bib tagging, no timing processing

* Storage: /processed/race/time~wpt~user~loc~file     # processed images 

* Storage: /thumbs/race/time~wpt~user~loc~file     # processed thumbnails 
* Firestore: races/:raceid/
    * doc: [raceId,RD,location,date, status, start time, waypoints, bib pattern]
    * images/time~wpt~user~loc~file   # Text annotations
        * status: "hidden", none=>active
    * startlist [bib,distance,category,name]
    * readings: 
        * [bib,waypoint,timing,gps]
    * results: 
        * [bib,dns/dnf/status,timing, [splits]]

## Modes

      timestamp
      bib: bibStr,
      userId: userId,
      waypoint: 
      // latlng: 
      imagePath: fileName,
      score

* text capture with distance
    _waypoint 5,10_   need text
* text capture without 
    _waypoint_ need text
* img capture with distance
    _waypoint 5,10_   
    * with extra bibs  additional bibs
    * will no bibs  * upload with UNKNOWN
* img capture without distance
* upload with exif date
* selfie upload

# Live races

## registration

New screen
bibno same as strava

## execution

list curent races

# Timing Processing rules

* match current day
* FUTURE timing range (watch timezone)
* Match sport_type e.g. Run
* match only original entries i.e. create vs change
* Take best possible time (in case multiple activities)
* find fastest consequentive race distance
* Take largest distance (e.g. !0k among 10 and 5)
* FUTURE (check splits)
* FUTURE check GPS location
* FUTURE farthest distance among all races
* FUTURE Check race registration
* Check activity time after start of the race....and FUTURE close before close
* FUTURE check paused activities ??? How to?
* Check Gender
* FUTURE Duplicate activities (duplicate apps)