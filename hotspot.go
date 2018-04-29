package hotspot

import (
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
)

// GeoJSON is a cache of the NYC Hotspot data.
var GeoJSON = make(map[string][]byte)

// cacheGeoJSON loads files under data into `GeoJSON`.
func cacheGeoJSON() {
	filenames, err := filepath.Glob("data/*")
	if err != nil {
		log.Fatal(err)
	}
	for _, f := range filenames {
		name := filepath.Base(f)
		dat, err := ioutil.ReadFile(f)
		if err != nil {
			log.Fatal(err)
		}
		GeoJSON[name] = dat
	}
}

// init is called from the App Engine runtime to initialize the app.
func init() {
	cacheGeoJSON()
	loadHotspots()
	http.HandleFunc("/data/wifi-hotspots", hotspotHandler)
}
