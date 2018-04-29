package hotspot

import (
        "encoding/json"
        "fmt"
        "log"
        "math"
        "net/http"
        "strconv"
        "strings"

        rtree "github.com/dhconnelly/rtreego"
        geojson "github.com/paulmach/go.geojson"
)

// Hotspots is an RTree housing the stations
var Hotspots = rtree.NewTree(2, 25, 50)

// Hotspot is a wrapper for `*geojson.Feature` so that we can implement
// `rtree.Spatial` interface type.
type Hotspot struct {
        feature *geojson.Feature
}

// Bounds implements `rtree.Spatial` so we can load
// stations into an `rtree.Rtree`.
func (h *Hotspot) Bounds() *rtree.Rect {
        return rtree.Point{
                h.feature.Geometry.Point[0],
                h.feature.Geometry.Point[1],
        }.ToRect(1e-6)
}

// loadStations loads the geojson features from
// `subway-stations.geojson` into the `Stations` rtree.
func loadHotspots() {
        hotspotsGeojson := GeoJSON["wifi-hotspots.geojson"]
        fc, err := geojson.UnmarshalFeatureCollection(hotspotsGeojson)
        if err != nil {
                // Note: this will take down the GAE instance by exiting this process.
                log.Fatal(err)
        }
        for _, f := range fc.Features {
                Hotspots.Insert(&Hotspot{f})
        }
}

// hotspotHandler reads r for a "viewport" query parameter
// and writes a GeoJSON response of the features contained in
// that viewport into w.
func hotspotHandler(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-type", "application/json")
        vp := r.FormValue("viewport")
        rect, err := newRect(vp)
        if err != nil {
                str := fmt.Sprintf("Couldn't parse viewport: %s", err)
                http.Error(w, str, 400)
                return
        }
        h := Hotspots.SearchIntersect(rect)
        fc := geojson.NewFeatureCollection()
        for _, hotspot := range h {
                fc.AddFeature(hotspot.(*Hotspot).feature)
        }
        err = json.NewEncoder(w).Encode(fc)
        if err != nil {
                str := fmt.Sprintf("Couldn't encode results: %s", err)
                http.Error(w, str, 500)
                return
        }
}

// newRect constructs a `*rtree.Rect` for a viewport.
func newRect(vp string) (*rtree.Rect, error) {
        ss := strings.Split(vp, "|")
        sw := strings.Split(ss[0], ",")
        swLat, err := strconv.ParseFloat(sw[0], 64)
        if err != nil {
                return nil, err
        }
        swLng, err := strconv.ParseFloat(sw[1], 64)
        if err != nil {
                return nil, err
        }
        ne := strings.Split(ss[1], ",")
        neLat, err := strconv.ParseFloat(ne[0], 64)
        if err != nil {
                return nil, err
        }
        neLng, err := strconv.ParseFloat(ne[1], 64)
        if err != nil {
                return nil, err
        }
        minLat := math.Min(swLat, neLat)
        minLng := math.Min(swLng, neLng)
        distLat := math.Max(swLat, neLat) - minLat
        distLng := math.Max(swLng, neLng) - minLng

        r, err := rtree.NewRect(
                rtree.Point{
                        minLng,
                        minLat,
                },
                []float64{
                        distLng,
                        distLat,
                })
        if err != nil {
                return nil, err
        }
        return r, nil
}