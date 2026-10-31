# GRAVITON 2026 – Problem Statement 06
## API Selection and Integration Plan

**Project:** Crowdsourced Extreme Weather Verification & GIS De-Duplicator  
**Goal:** Collect disaster-related information from social media, satellite imagery, news portals, and weather services; verify it; remove duplicate media; and display incidents on an interactive map.

> **Hackathon constraint:** The team has approximately 18 hours. Prioritise APIs that are accessible immediately. Do not make the prototype dependent on restricted social-media access.

---

# 1. Snapchat API

**What we want:** Find publicly shared disaster-related Stories and location-associated content.

**API:** Snapchat Story Kit  
**Documentation:** https://github.com/Snapchat/storykit

Potential use:
- Access supported public Story content.
- Use available location information for supported Our Story content.
- Explore location-associated disaster reports.

**Limitations:**
- Story Kit is not unrestricted access to Snap Map.
- Partner onboarding and credentials may be required.
- It does not provide access to every public Snap or Story.

**Recommendation:** Do not depend on Snapchat for the hackathon demo. Treat it as a future integration unless access is already approved.

---

# 2. Instagram API

**What we want:** Discover disaster-related posts through hashtags and relevant public content.

**API:** Instagram Graph API  
**Documentation:** https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/

Potential use:
- Access supported Instagram professional-account media.
- Discover media through supported hashtag searches.
- Retrieve available post information and captions.

**Limitations:**
- Hashtag discovery has restrictions.
- Account type, permissions, and app access requirements apply.
- It does not provide unrestricted access to every public Instagram post.

**Recommendation:** Explore it if the team already has the required Meta app and permissions. Do not make it a core dependency.

---

# 3. Satellite APIs

Satellite information can provide independent observations that help corroborate reports.

## A. NASA FIRMS

**Documentation:** https://firms.modaps.eosdis.nasa.gov/api/

What it provides:
- Active fire locations.
- Satellite detection coordinates.
- Detection time.
- Fire confidence.
- Brightness measurements.
- Fire radiative power.

**Example use:** A wildfire is reported in Himachal Pradesh. NASA FIRMS observations can be checked for nearby fire detections, which can then be plotted on the map.

**Access:** Free MAP_KEY required.

## B. NASA GIBS

**Documentation:** https://www.earthdata.nasa.gov/data/tools/gibs

What it provides:
- Satellite imagery layers.
- Earth imagery visualisation.
- Environmental observation layers.
- Cloud and other available imagery products.

**Example use:** Display satellite imagery layers alongside reported disaster locations.

## C. Sentinel Hub

**Website:** https://www.sentinel-hub.com/

Potential use:
- Sentinel satellite imagery.
- Flood-extent analysis.
- Land-surface changes.
- Vegetation changes.
- Before-and-after imagery comparisons.

**Limitations:** Check current account quotas, access plans, and processing limits.

> **Important:** Satellite imagery is not live CCTV footage. Satellites collect observations at particular intervals, and imagery may have processing delays.

**Recommendation:** Start with NASA FIRMS for fire detections. Explore NASA GIBS for map imagery. Use Sentinel Hub only if time and access allow.

---

# 4. News Portal APIs

**What we want:** Collect disaster-related news, extract the location and event details, and compare the information with other reports.

Potential workflow:
1. Collect a relevant article.
2. Extract the disaster category.
3. Identify the mentioned location.
4. Extract the publication time.
5. Compare the information with other available evidence.
6. Display the report on the map.

## A. GDELT

**Website:** https://www.gdeltproject.org/

What it provides:
- Global news monitoring.
- Searchable news coverage.
- Article information and source links.
- Event-related data.

Potential searches:
- Floods in India.
- Earthquakes.
- Landslides.
- Cyclones.
- Forest fires.

**Recommendation:** Start with GDELT as a news-data source.

## B. NewsAPI

**Pricing:** https://newsapi.org/pricing

What it provides:
- News headlines.
- Article search.
- News source information.

**Free Developer plan limitations noted in the plan:**
- 100 requests per day.
- Articles delayed by 24 hours.
- Search limited to articles from the previous month.
- Development/testing use rather than production deployment.

## C. Other options

| API | What it provides | Access |
|---|---|---|
| GNews | News from multiple sources | Limited free tier |
| NewsData.io | Latest news and news search | Limited free tier |

Check current quotas and terms before implementation.

---

# 5. IMD API – Indian Meteorological Department

**API portal:** https://api.imd.gov.in/public/index.php  
**API reference:** https://api.imd.gov.in/public/api_reference.html

This is especially relevant because the project is intended for disaster management in India.

Potential data includes:

| API / Dataset | Information |
|---|---|
| City Weather Forecast | City-level forecasts |
| District Rainfall Forecast | District-level rainfall forecasts |
| Current Weather | Current weather observations |
| District-wise Nowcast | Short-term weather alerts |
| District-wise Warnings | Official weather warnings |
| State-wise Rainfall | Rainfall information |
| River Basin Forecast | Quantitative precipitation forecasts |

**Example use:** A citizen reports flooding in Mohali. The system checks relevant IMD warnings and available rainfall information for the reported area and time.

**Access note:** Register on the official portal and check the access requirements for each endpoint. Do not assume all endpoints are immediately available without approval.

**Recommendation:** Definitely explore IMD for Indian weather alerts and forecasts.

---

# 6. Google Maps API and Alternatives

**Google Maps Platform documentation:** https://developers.google.com/maps/documentation

Relevant services:

| API | What it does |
|---|---|
| Maps JavaScript API | Displays interactive maps |
| Geocoding API | Converts addresses to coordinates and vice versa |
| Places API | Finds places and establishments |
| Routes API | Calculates routes |
| Roads API | Provides road-related geographic information |

Potential use:
- Plot disaster locations.
- Display roads and nearby places.
- Search for locations.
- Calculate possible emergency routes.

**Cost note:** Google Maps Platform has monthly free usage caps that vary by API/SKU. Billing setup is required, and charges may apply after applicable free limits. Check current pricing before enabling services.

## Free-oriented alternative

Use:
- **Leaflet.js:** https://leafletjs.com/
- **OpenStreetMap:** https://www.openstreetmap.org/
- **Nominatim:** https://nominatim.org/release-docs/latest/api/Reverse/

What each does:
- Leaflet provides the interactive map interface.
- OpenStreetMap provides map data and tiles.
- Nominatim converts coordinates into readable addresses and vice versa.

**Nominatim limitation:** The public service has a strict usage policy, including a maximum of one request per second. Do not use it for high-volume geocoding.

**Recommendation:** For a quick prototype without Google billing setup, use Leaflet with OpenStreetMap. Use Nominatim carefully for low-volume reverse geocoding.

---

# 7. Global Weather and Disaster APIs

## A. Open-Meteo

**Documentation:** https://open-meteo.com/en/docs

What it provides:
- Temperature.
- Rainfall.
- Wind speed.
- Weather forecasts.
- Historical weather data.
- Flood forecast data.

**Access:** No API key or registration is needed for the free API. Free access is for eligible non-commercial use and is subject to usage limits and terms.

**Example use:** Compare a reported flood's location and time with rainfall information. This is supporting evidence, not proof that the image or flood report is authentic.

## B. OpenWeather

**Website:** https://openweathermap.org/api

What it provides:
- Current weather.
- Forecasts.
- Other weather-related data, depending on the selected service.

**Access:** A free tier is available; check current limits and terms.

## C. GDACS

**API documentation:** https://www.gdacs.org/gdacsapi/swagger/index.html

What it provides:
- Global disaster alerts.
- Flood information.
- Earthquake information.
- Tropical cyclone information.
- Alert levels.
- Geographical information.

**Access:** Disaster data is available free of charge, with source acknowledgement required according to the referenced documentation.

**Recommendation:** Use Open-Meteo for weather context and GDACS for global disaster alerts.

---

# 8. AI APIs and Technologies

AI can analyse incoming reports, but it should not be treated as the sole authority for deciding whether an incident is genuine.

| API / Technology | Purpose | Potential use |
|---|---|---|
| Gemini API | Multimodal AI analysis | Analyse images and report text |
| OpenAI API | Multimodal AI analysis | Analyse supported images and text |
| Hugging Face | Pretrained ML models | Image classification and detection |
| Google Cloud Vision | Image analysis and OCR | Labels, text extraction, image properties |
| CLIP | Image-text embeddings | Compare images with descriptions |

## Gemini API

**Documentation:** https://ai.google.dev/gemini-api/docs

Potential use:
- Classify disaster-related images.
- Identify visible signs of floods, fires, or damaged buildings.
- Analyse captions and report text.
- Compare an image with the claimed incident.
- Explain what the model can and cannot determine.

A free tier is available for supported models, subject to usage limits and terms.

## Hugging Face

**Models:** https://huggingface.co/models

Explore pretrained models for:
- Image classification.
- Object detection.
- Fire and flood-related image analysis.
- Other relevant computer-vision tasks.

Suitable models may also be run locally.

## Google Cloud Vision

**Documentation:** https://cloud.google.com/vision/docs

Potential use:
- Image labelling.
- OCR / text extraction.
- Object detection.
- Image properties.

Check pricing and trial eligibility before relying on it.

---

# 9. Duplicate Detection Technologies

Duplicate detection should be implemented as a separate pipeline rather than left entirely to a general-purpose AI model.

| Technology | Purpose |
|---|---|
| Perceptual Hashing (pHash) | Finds visually similar images |
| OpenCV | Image processing and comparison |
| ImageHash (Python) | Generates image fingerprints |
| FAISS | Searches similar vectors efficiently |
| CLIP embeddings | Finds semantically similar images |

## Example workflow

Three people upload the same flood photograph.

1. Generate a perceptual hash for each image.
2. Compare the hashes.
3. Detect likely visual duplicates.
4. Group the related reports.
5. Display one incident with multiple contributing reports.

Additional checks:
- Compare timestamps where available.
- Inspect image metadata.
- Compare reported locations.
- Flag potentially old media for review.

**Caution:** Similar-looking images are not necessarily duplicates. Metadata can be missing or manipulated. A duplicate match should be treated as a signal for review, not automatic proof.

---

# 10. Recommended API Selection

Do not integrate every available service. For an 18-hour hackathon, start with a small, reliable stack.

| No. | Source | API / Technology | Purpose | Access notes |
|---|---|---|---|---|
| 1 | Satellite | NASA FIRMS | Satellite fire detections | Free MAP_KEY |
| 2 | Satellite | NASA GIBS | Satellite imagery layers | Free access |
| 3 | News | GDELT | Global disaster news | Free access |
| 4 | Weather | IMD API | Official Indian weather data | Registration/access |
| 5 | Weather | Open-Meteo | Rainfall, temperature, wind | Free non-commercial use |
| 6 | Disaster alerts | GDACS | Global disaster reports | Free |
| 7 | Maps | Leaflet + OpenStreetMap | Interactive GIS dashboard | Free-oriented; follow usage policies |
| 8 | AI | Gemini API | Image and report analysis | Free tier with limits |
| 9 | Duplicate detection | ImageHash + OpenCV | Detect visually similar images | Open-source libraries |
| 10 | Social media | Snapchat / Instagram | Potential public social-media sources | Restricted access |

---

# 11. How Everything Connects

```text
                 DATA COLLECTION
                        |
       +----------------+----------------+
       |                |                |
    Social Media      Satellite        Weather
   (if accessible)    NASA FIRMS       IMD
       |              NASA GIBS      Open-Meteo
       |                |                |
       +----------------+----------------+
                        |
                   News Sources
                      GDELT
                        |
                        v
                 DATA PROCESSING
                        |
          +-------------+-------------+
          |             |             |
       AI Image      Duplicate      Location
       Analysis      Detection     Verification
          |             |             |
          +-------------+-------------+
                        |
                        v
                 INCIDENT ENGINE
                        |
          +-------------+-------------+
          |             |             |
       Incident       Risk          Evidence
       Clusters       Score         Sources
          |             |             |
          +-------------+-------------+
                        |
                        v
                  GIS DASHBOARD
                        |
              DISASTER COMMAND CENTRE
```

---

# 12. Example: How the Platform Handles a Flood

Imagine a flood occurs in Punjab.

## Stage 1 – Data collection

The platform receives:
- A citizen-uploaded flood photograph.
- A relevant news article.
- An IMD weather warning.
- Available satellite observations.
- Weather information from Open-Meteo.

## Stage 2 – AI processing

Each report goes through:

1. **Disaster classification:** Does the image or report describe a flood?
2. **Image analysis:** Does the image visibly support the reported incident?
3. **Duplicate detection:** Has the same or a similar image appeared before?
4. **Timestamp analysis:** Is the media potentially old?
5. **Location extraction:** Where does the report claim the incident occurred?

## Stage 3 – Cross-source verification

The system compares the available evidence.

| Source | Information |
|---|---|
| Citizen upload | Flood photograph |
| News portal | Flooding reported in Mohali |
| IMD | Heavy rainfall warning |
| Weather API | Rainfall information |
| Satellite | Relevant satellite observations, if available |

The system groups reports that may refer to the same incident and presents the supporting evidence.

## Stage 4 – GIS dashboard

The command centre displays:
- Incident locations.
- Disaster categories.
- Verification status.
- Supporting sources.
- Duplicate reports.
- Severity and priority.

**Important:** Matching weather data or a news article supports a report but does not independently prove that the uploaded photograph is authentic.

---

# 13. Development Priorities for the 18-Hour Hackathon

| Priority | Integration | Reason |
|---|---|---|
| 1 | NASA FIRMS | Real satellite-based fire data |
| 2 | IMD | Indian weather warnings |
| 3 | Open-Meteo | Weather verification |
| 4 | GDELT | News collection |
| 5 | Gemini | AI image analysis |
| 6 | Leaflet + OpenStreetMap | GIS dashboard |
| 7 | GDACS | Disaster event correlation |
| 8 | Snapchat / Instagram | Optional social-media integration |

## First four integrations to attempt

1. **IMD:** Indian weather information.
2. **NASA FIRMS:** Satellite fire detections.
3. **GDELT:** News reports.
4. **Open-Meteo:** Global weather data.

Then integrate Gemini and the GIS dashboard.

Do not spend hours trying to obtain Snapchat and Instagram permissions during the hackathon. Build the social-media ingestion module so it can accept those sources later. If access is unavailable, use clearly labelled sample reports for the demonstration.

---

# 14. Standout Feature: Multi-Source Incident Correlation

Instead of treating every incoming post as a separate disaster, group reports that potentially refer to the same event.

**Example:**
- 12 citizen reports.
- 4 news articles.
- 2 satellite observations.
- 1 official weather warning.

The platform identifies that these may all relate to one flood event.

The authority sees **one incident with 19 associated pieces of evidence**, rather than 19 unrelated reports.

This demonstrates the core intelligence of the solution: collecting, correlating, verifying, and deduplicating disaster information.

---

## Final Recommendation

Build a multi-source disaster intelligence platform, but prioritise APIs that your team can actually access during the hackathon.

**Core stack:**
- NASA FIRMS
- IMD
- GDELT
- Open-Meteo
- Gemini
- Leaflet + OpenStreetMap
- ImageHash + OpenCV

Keep Snapchat and Instagram as optional integrations until access is confirmed.

The goal is not to integrate the largest number of APIs. It is to demonstrate a working system that turns scattered disaster reports into organised, evidence-backed incident intelligence.
