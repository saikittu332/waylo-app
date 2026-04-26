import React from "react";
import { StyleSheet, View } from "react-native";
import RoutePreviewFallback from "./RoutePreviewFallback";
import { colors, radii, shadows } from "../constants/theme";
import { getMapboxAccessToken, hasMapboxToken } from "../services/mapService";

let MapboxGL = null;
try {
  const mapboxModule = require("@rnmapbox/maps");
  MapboxGL = mapboxModule.default || mapboxModule;
  MapboxGL.setAccessToken?.(getMapboxAccessToken());
} catch (error) {
  MapboxGL = null;
}

export default function RoutePreviewMap({ route, originLabel, destinationLabel }) {
  const geometry = route?.map?.geometry;
  const origin = route?.origin?.coordinates;
  const destination = route?.destination?.coordinates;
  const canRenderNativeMap = MapboxGL && hasMapboxToken() && geometry && origin && destination;

  if (!canRenderNativeMap) {
    return <RoutePreviewFallback destinationLabel={destinationLabel} originLabel={originLabel} route={route} />;
  }

  return (
    <View style={styles.mapCard}>
      <MapboxGL.MapView style={styles.nativeMap} logoEnabled={false} attributionEnabled={false}>
        <MapboxGL.Camera
          bounds={{
            ne: [
              Math.max(origin[0], destination[0]),
              Math.max(origin[1], destination[1])
            ],
            sw: [
              Math.min(origin[0], destination[0]),
              Math.min(origin[1], destination[1])
            ],
            paddingBottom: 54,
            paddingLeft: 54,
            paddingRight: 54,
            paddingTop: 54
          }}
          animationDuration={0}
        />
        <MapboxGL.ShapeSource id="waylo-route" shape={geometry}>
          <MapboxGL.LineLayer
            id="waylo-route-line"
            style={{
              lineColor: colors.blue,
              lineWidth: 5,
              lineCap: "round",
              lineJoin: "round"
            }}
          />
        </MapboxGL.ShapeSource>
        <MapboxGL.PointAnnotation id="origin" coordinate={origin} />
        <MapboxGL.PointAnnotation id="destination" coordinate={destination} />
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    backgroundColor: colors.mapBlue,
    borderRadius: radii.xl,
    height: 420,
    overflow: "hidden",
    ...shadows.card
  },
  nativeMap: {
    flex: 1
  }
});
