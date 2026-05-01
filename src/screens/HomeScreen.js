import React, { useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import PremiumCard from "../components/PremiumCard";
import PrimaryButton from "../components/PrimaryButton";
import TripModeChip from "../components/TripModeChip";
import { colors, radii, screen, spacing } from "../constants/theme";
import { mockTripRequest } from "../data/mockTrip";
import { defaultVehicle } from "../data/mockVehicleSpecs";
import { apiTripToCompletedTrip, deleteVehicle, getSavedPlans, getTrips, getVehicles, updateUser } from "../services/api";
import { getCurrentLocationPlace } from "../services/locationService";
import { CURRENT_LOCATION_PLACE, geocodeAddress, hasMapboxToken } from "../services/mapService";
import { routeMetaLabel, routeTitle } from "../utils/placeLabels";

const modes = ["Fastest", "Cheapest", "Scenic", "Comfort"];
const locationSuggestions = [
  CURRENT_LOCATION_PLACE,
  { id: "sf-fallback", label: "San Francisco, CA", coordinates: [-122.4194, 37.7749] },
  { id: "la-fallback", label: "Los Angeles, CA", coordinates: [-118.2437, 34.0522] },
  { id: "yosemite-fallback", label: "Yosemite, CA", coordinates: [-119.5383, 37.8651] },
  { id: "vegas-fallback", label: "Las Vegas, NV", coordinates: [-115.1398, 36.1699] },
  { id: "grand-canyon-fallback", label: "Grand Canyon, AZ", coordinates: [-112.1401, 36.0544] }
];
const tabs = [
  { label: "Home", icon: "home" },
  { label: "Trips", icon: "map" },
  { label: "Navigate", icon: "navigate" },
  { label: "Vehicle", icon: "car-sport" },
  { label: "Profile", icon: "person" }
];

export default function HomeScreen({ navigation, route }) {
  const [user, setUser] = useState(route.params?.user || null);
  const [assistantName, setAssistantName] = useState(route.params?.assistantName || "Waylo");
  const vehicle = route.params?.vehicle || defaultVehicle;
  const initialVehicles = route.params?.vehicles || [vehicle];
  const [activeTab, setActiveTab] = useState("Home");
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState(mockTripRequest.to);
  const [fromPlace, setFromPlace] = useState(CURRENT_LOCATION_PLACE);
  const [toPlace, setToPlace] = useState(null);
  const [mode, setMode] = useState(mockTripRequest.mode);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicle);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [plannedTrips, setPlannedTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.user) {
        setUser(route.params.user);
      }
      if (route.params?.assistantName) {
        setAssistantName(route.params.assistantName);
      }
      if (route.params?.vehicle) {
        setVehicles((current) => {
          const exists = current.some((item) => item.vehicleName === route.params.vehicle.vehicleName);
          return exists ? current.map((item) => (item.vehicleName === route.params.vehicle.vehicleName ? route.params.vehicle : item)) : [...current, route.params.vehicle];
        });
        setSelectedVehicle(route.params.vehicle);
      }
      if (route.params?.savedPlan) {
        setPlannedTrips((current) => {
          const exists = current.some((item) => item.id === route.params.savedPlan.id);
          return exists ? current.map((item) => (item.id === route.params.savedPlan.id ? route.params.savedPlan : item)) : [route.params.savedPlan, ...current];
        });
        navigation.setParams({ savedPlan: undefined });
      }
      if (route.params?.completedTrip) {
        setCompletedTrips((current) => {
          const exists = current.some((item) => item.id === route.params.completedTrip.id);
          return exists ? current.map((item) => (item.id === route.params.completedTrip.id ? route.params.completedTrip : item)) : [route.params.completedTrip, ...current];
        });
        setPlannedTrips((current) => current.filter((item) => item.id !== route.params.completedTrip.savedPlanId));
        navigation.setParams({ completedTrip: undefined });
      }
      if (route.params?.deletedPlanId) {
        setPlannedTrips((current) => current.filter((item) => item.id !== route.params.deletedPlanId));
        navigation.setParams({ deletedPlanId: undefined });
      }
    }, [navigation, route.params?.assistantName, route.params?.completedTrip, route.params?.deletedPlanId, route.params?.savedPlan, route.params?.user, route.params?.vehicle])
  );

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      async function loadPersistedData() {
        if (!user?.id) return;
        try {
          const [apiVehicles, apiPlans, apiTrips] = await Promise.all([
            getVehicles(user.id),
            getSavedPlans(user.id),
            getTrips(user.id)
          ]);
          if (!active) return;
          if (apiVehicles.length > 0) {
            setVehicles(apiVehicles);
            setSelectedVehicle((current) => apiVehicles.find((item) => item.id === user?.active_vehicle_id) || apiVehicles.find((item) => item.id === current?.id) || apiVehicles[0]);
          }
          setPlannedTrips(apiPlans);
          setCompletedTrips(
            apiTrips
              .filter((trip) => trip.status === "completed")
              .map((trip) => apiTripToCompletedTrip(trip, apiVehicles.find((item) => item.id === trip.vehicle_id)?.vehicleName || selectedVehicle?.vehicleName))
          );
        } catch (error) {
          console.warn("Waylo API home refresh unavailable:", error.message);
        }
      }
      loadPersistedData();
      return () => {
        active = false;
      };
    }, [user?.id])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {activeTab === "Home" && (
          <PlanTripContent
            assistantName={assistantName}
            user={user}
            vehicle={selectedVehicle}
            vehicles={vehicles}
            navigation={navigation}
            from={from}
            setFrom={setFrom}
            fromPlace={fromPlace}
            setFromPlace={setFromPlace}
            to={to}
            setTo={setTo}
            toPlace={toPlace}
            setToPlace={setToPlace}
            mode={mode}
            setMode={setMode}
            showVehiclePicker={showVehiclePicker}
            setShowVehiclePicker={setShowVehiclePicker}
            setSelectedVehicle={setSelectedVehicle}
            plannedTrips={plannedTrips}
            completedTrips={completedTrips}
          />
        )}
        {activeTab === "Trips" && (
          <TripsContent
            assistantName={assistantName}
            user={user}
            vehicle={selectedVehicle}
            navigation={navigation}
            from={from}
            to={to}
            mode={mode}
            plannedTrips={plannedTrips}
            completedTrips={completedTrips}
          />
        )}
        {activeTab === "Navigate" && (
          <NavigateContent
            assistantName={assistantName}
            user={user}
            navigation={navigation}
            plannedTrips={plannedTrips}
            vehicle={selectedVehicle}
          />
        )}
        {activeTab === "Vehicle" && (
          <VehicleContent
            assistantName={assistantName}
            user={user}
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            setVehicles={setVehicles}
            setSelectedVehicle={setSelectedVehicle}
            navigation={navigation}
          />
        )}
        {activeTab === "Profile" && (
          <ProfileContent
            assistantName={assistantName}
            setAssistantName={setAssistantName}
            user={user}
            setUser={setUser}
            navigation={navigation}
            tripCount={plannedTrips.length + completedTrips.length}
          />
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.label}
            onPress={() => setActiveTab(tab.label)}
            style={styles.tabItem}
          >
            <Ionicons
              color={tab.label === activeTab ? colors.navy : colors.mutedLight}
              name={tab.icon}
              size={21}
            />
            <Text style={[styles.tabLabel, tab.label === activeTab && styles.activeTab]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function PlanTripContent({ assistantName, user, vehicle, vehicles, navigation, from, setFrom, fromPlace, setFromPlace, to, setTo, toPlace, setToPlace, mode, setMode, showVehiclePicker, setShowVehiclePicker, setSelectedVehicle, plannedTrips, completedTrips }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationSearchState, setLocationSearchState] = useState({ from: false, to: false });
  const [locating, setLocating] = useState(false);
  const popoverAnim = React.useRef(new Animated.Value(0)).current;
  const isSearchingLocations = locationSearchState.from || locationSearchState.to;

  React.useEffect(() => {
    if (notificationsOpen) {
      popoverAnim.setValue(0);
      Animated.timing(popoverAnim, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true
      }).start();
    }
  }, [notificationsOpen, popoverAnim]);

  function continuePlan() {
    setShowVehiclePicker(false);
    navigation.navigate("TripResults", {
      assistantName,
      user,
      vehicle,
      tripRequest: {
        from,
        to,
        mode,
        originPlace: fromPlace,
        destinationPlace: toPlace
      }
    });
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const place = await getCurrentLocationPlace();
      setFrom("Current Location");
      setFromPlace(place);
    } catch (error) {
      setFrom(error.message || "Location unavailable");
      setFromPlace(CURRENT_LOCATION_PLACE);
    } finally {
      setLocating(false);
    }
  }

  async function selectVehicleForTrip(item) {
    setSelectedVehicle(item);
    setShowVehiclePicker(false);
    if (user?.id && item.id) {
      try {
        await updateUser(user.id, { active_vehicle_id: item.id });
      } catch (error) {
        console.warn("Waylo API active vehicle update unavailable:", error.message);
      }
    }
  }

  return (
    <>
      <View style={styles.homeHero}>
        <View style={styles.heroMain}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroEyebrow}>Waylo ready</Text>
            <Text style={styles.heroStatus}>2 alerts</Text>
          </View>
          <Text style={styles.heroTitle}>Where are we driving?</Text>
          <Text style={styles.heroCopy}>{assistantName} will compare fuel, rest timing, and comfort before you go.</Text>
          <View style={styles.heroMetrics}>
            <MiniMetric icon="cash-outline" label="Savings" value="$14 est." />
            <MiniMetric icon="car-sport-outline" label="Vehicle" value={vehicle.vehicleName.replace("Toyota ", "")} />
          </View>
        </View>
        <Pressable onPress={() => setNotificationsOpen((value) => !value)} style={styles.bellButton} hitSlop={8}>
          <Ionicons color={colors.navy} name="notifications-outline" size={20} />
          <View style={styles.bellDot} />
        </Pressable>
        {notificationsOpen && (
          <Animated.View
            style={[
              styles.notificationPanel,
              {
                opacity: popoverAnim,
                transform: [
                  { translateY: popoverAnim.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
                  { scale: popoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }
                ]
              }
            ]}
          >
            <View style={styles.popoverPointer} />
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationHeading}>Notifications</Text>
              <Pressable onPress={() => setNotificationsOpen(false)} hitSlop={8}>
                <Ionicons color={colors.muted} name="close" size={18} />
              </Pressable>
            </View>
            <NotificationRow icon="pricetag-outline" title="Fuel price watch" detail="Prices near Bakersfield are trending lower." />
            <View style={styles.listDivider} />
            <NotificationRow icon="time-outline" title="Rest reminder ready" detail="A break will be suggested around 2.5 hours." />
          </Animated.View>
        )}
      </View>
      <PremiumCard style={styles.tripCard}>
        <Text style={styles.cardTitle}>Plan Your Trip</Text>
        <TripField
          label="From"
          value={from}
          onChangeText={setFrom}
          onSearchStateChange={(loading) => setLocationSearchState((current) => ({ ...current, from: loading }))}
          onSelectPlace={setFromPlace}
          onUseCurrentLocation={useCurrentLocation}
          locating={locating}
          pinColor="#367CFF"
          suggestions={locationSuggestions}
        />
        <TripField
          label="To"
          value={to}
          onChangeText={setTo}
          onSearchStateChange={(loading) => setLocationSearchState((current) => ({ ...current, to: loading }))}
          onSelectPlace={setToPlace}
          pinColor={colors.red}
          suggestions={locationSuggestions.filter((item) => item.id !== CURRENT_LOCATION_PLACE.id)}
        />
        <Text style={styles.label}>Trip Mode</Text>
        <View style={styles.modes}>
          {modes.map((item) => (
            <TripModeChip key={item} label={item} selected={mode === item} onPress={() => setMode(item)} />
          ))}
        </View>
        <Pressable onPress={() => setShowVehiclePicker((value) => !value)} style={styles.selectedVehicleCard}>
          <View style={styles.vehicleIconMini}>
            <Ionicons color={colors.blue} name="car-sport-outline" size={20} />
          </View>
          <View style={styles.selectedVehicleText}>
            <Text style={styles.selectedVehicleLabel}>Vehicle</Text>
            <Text style={styles.selectedVehicleName}>{vehicle.vehicleName}</Text>
          </View>
          <Ionicons color={colors.muted} name={showVehiclePicker ? "chevron-up" : "chevron-down"} size={20} />
        </Pressable>
        {showVehiclePicker && (
          <View style={styles.vehiclePicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.label}>Choose vehicle for this trip</Text>
              <Pressable onPress={() => setShowVehiclePicker(false)} hitSlop={8} style={styles.textAction}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
            {vehicles.map((item) => (
              <Pressable
                key={item.vehicleName}
                onPress={() => {
                  selectVehicleForTrip(item);
                }}
                style={styles.vehicleOption}
              >
                <Ionicons color={colors.blue} name="car-sport-outline" size={19} />
                <View style={styles.selectedVehicleText}>
                  <Text style={styles.vehicleOptionName}>{item.vehicleName}</Text>
                  <Text style={styles.vehicleOptionMeta}>{item.highwayMpg} highway MPG | {item.tankCapacity} gal</Text>
                </View>
              </Pressable>
            ))}
            <Pressable onPress={() => navigation.navigate("VehicleSetup", { assistantName, user, mode: "new", vehicles })} style={styles.addVehicleInline}>
              <Ionicons color={colors.blue} name="add-circle-outline" size={19} />
              <Text style={styles.addVehicleText}>Add new vehicle</Text>
            </Pressable>
          </View>
        )}
        <PrimaryButton
          disabled={isSearchingLocations}
          title={isSearchingLocations ? "Searching locations..." : "Plan Smart Trip"}
          onPress={continuePlan}
        />
      </PremiumCard>
      <TripsContent
        assistantName={assistantName}
        user={user}
        vehicle={vehicle}
        navigation={navigation}
        from={from}
        to={to}
        mode={mode}
        compact
        plannedTrips={plannedTrips}
        completedTrips={completedTrips}
      />
    </>
  );
}

function MiniMetric({ icon, label, value }) {
  return (
    <View style={styles.miniMetric}>
      <Ionicons color={colors.blue} name={icon} size={15} />
      <View>
        <Text style={styles.miniMetricLabel}>{label}</Text>
        <Text style={styles.miniMetricValue}>{value}</Text>
      </View>
    </View>
  );
}

function NotificationRow({ icon, title, detail }) {
  return (
    <View style={styles.notificationRow}>
      <View style={styles.notificationIcon}>
        <Ionicons color={colors.blue} name={icon} size={17} />
      </View>
      <View style={styles.recentText}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function TripsContent({ assistantName, user, vehicle, navigation, from, to, mode, compact, plannedTrips = [], completedTrips = [] }) {
  const [selectedSection, setSelectedSection] = useState("Ready");
  const visiblePlans = compact ? plannedTrips.slice(0, 1) : plannedTrips;
  const showingReady = selectedSection === "Ready";

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{compact ? "Saved Plans" : "Trips"}</Text>
      </View>
      <PremiumCard style={styles.recentCard}>
        {!compact && (
          <View style={styles.tripSections}>
            {["Ready", "Completed"].map((section) => (
              <Pressable
                key={section}
                onPress={() => setSelectedSection(section)}
                style={[styles.tripSectionTab, selectedSection === section && styles.tripSectionTabActive]}
              >
                <Text style={[styles.tripSectionText, selectedSection === section && styles.tripSectionTextActive]}>
                  {section === "Ready" ? "Ready to Drive" : "Completed"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        {compact && <Text style={styles.groupLabel}>Ready to Drive</Text>}
        {(compact || showingReady) && (
          visiblePlans.length === 0 ? (
            <Text style={styles.emptyText}>Saved trip plans will appear here.</Text>
          ) : (
            visiblePlans.map((plan, index) => (
              <React.Fragment key={plan.id}>
                <RecentTrip
                  badge="Saved"
                  title={plan.title || routeTitle(plan.from, plan.to)}
                  date={routeMetaLabel(plan)}
                  onPress={() => navigation.navigate("TripDetail", { plan, type: "ready" })}
                />
                {index < visiblePlans.length - 1 && <View style={styles.listDivider} />}
              </React.Fragment>
            ))
          )
        )}
        {!compact && !showingReady && (
          completedTrips.length === 0 ? (
            <Text style={styles.emptyText}>Finished trips will appear here after you end navigation and save the summary.</Text>
          ) : (
            completedTrips.map((trip, index) => (
              <React.Fragment key={trip.id}>
                <RecentTrip
                  badge="Done"
                  title={trip.title || routeTitle(trip.from, trip.to)}
                  date={routeMetaLabel(trip)}
                  onPress={() => navigation.navigate("TripDetail", { completedTrip: trip, plan: trip, type: "completed" })}
                />
                {index < completedTrips.length - 1 && <View style={styles.listDivider} />}
              </React.Fragment>
            ))
          )
        )}
      </PremiumCard>
    </>
  );
}

function NavigateContent({ navigation, plannedTrips }) {
  function startSavedPlan(plan) {
    const route = plan.routePayload || {
      from: plan.from,
      to: plan.to,
      mode: plan.mode,
      distanceMiles: plan.distanceMiles || 383,
      durationHours: plan.durationHours || 6.75
    };
    navigation.navigate("Navigation", {
      tripPlan: {
        savedPlanId: plan.id,
        persistedTrip: plan.tripId ? { id: plan.tripId } : null,
        vehicleName: plan.vehicleName,
        route,
        insights: {
          estimatedFuelCost: plan.estimatedFuelCost,
          estimatedSavings: plan.estimatedSavings
        },
        fullStops: [
          { id: "quick-fuel", type: "fuel", name: "Best Fuel Stop" }
        ]
      }
    });
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Navigate</Text>
      </View>
      <View style={styles.liveMapCard}>
        <View style={styles.mapLandMass} />
        <View style={styles.mapRoadOne} />
        <View style={styles.mapRoadTwo} />
        <View style={styles.currentLocationPulse} />
        <View style={styles.currentLocationDot}>
          <Ionicons color={colors.surface} name="navigate" size={18} />
        </View>
        <View style={styles.mapCaption}>
          <Text style={styles.mapCaptionTitle}>Current location</Text>
          <Text style={styles.mapCaptionText}>Live route view placeholder</Text>
        </View>
        <PremiumCard style={styles.routeSheet}>
          <Text style={styles.groupLabel}>Ready Routes</Text>
          {plannedTrips.length === 0 ? (
            <Text style={styles.emptyText}>No saved plans yet. Build a route and tap Save for Later.</Text>
          ) : (
            plannedTrips.map((plan, index) => (
              <React.Fragment key={plan.id}>
                <View style={styles.navPlanRow}>
                  <View style={styles.recentText}>
                    <Text style={styles.recentTitle}>{plan.title || routeTitle(plan.from, plan.to)}</Text>
                    <Text style={styles.recentDate}>{routeMetaLabel(plan)}</Text>
                  </View>
                  <Pressable
                    onPress={() => startSavedPlan(plan)}
                    style={styles.startMiniButton}
                  >
                    <Ionicons color={colors.surface} name="navigate" size={15} />
                    <Text style={styles.startMiniText}>Start</Text>
                  </Pressable>
                </View>
                {index < plannedTrips.length - 1 && <View style={styles.listDivider} />}
              </React.Fragment>
            ))
          )}
        </PremiumCard>
      </View>
    </>
  );
}

function VehicleContent({ assistantName, user, vehicles, selectedVehicle, setVehicles, setSelectedVehicle, navigation }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  async function removeVehicle(item) {
    if (vehicles.length <= 1) {
      setDeleteMessage("Waylo needs at least one vehicle to estimate route range and fuel cost. Add another vehicle first, then delete this one.");
      return;
    }
    try {
      if (item.id) await deleteVehicle(item.id);
      const remainingVehicles = vehicles.filter((vehicle) => (item.id ? vehicle.id !== item.id : vehicle.vehicleName !== item.vehicleName));
      setVehicles(remainingVehicles);
      if ((item.id && selectedVehicle?.id === item.id) || selectedVehicle?.vehicleName === item.vehicleName) {
        setSelectedVehicle(remainingVehicles[0]);
      }
      setPendingDelete(null);
    } catch (error) {
      setDeleteMessage(error.message || "Could not delete vehicle.");
    }
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Vehicles</Text>
        <Pressable onPress={() => navigation.navigate("VehicleSetup", { assistantName, user, mode: "new", vehicles })} hitSlop={8} style={styles.textAction}>
          <Text style={styles.viewAll}>Add vehicle</Text>
        </Pressable>
      </View>
      {vehicles.map((item) => (
        <PremiumCard key={item.id || item.vehicleName} style={styles.vehicleListCard}>
          <View style={styles.vehiclePhoto}>
            <View style={styles.vehiclePhotoRoad} />
            <Ionicons color={colors.blue} name="car-sport" size={56} />
          </View>
          <Text style={styles.cardTitle}>{item.vehicleName}</Text>
          <Text style={styles.profileMeta}>{item.fuelType.toUpperCase()} | {item.cityMpg} city MPG | {item.highwayMpg} highway MPG</Text>
          <Text style={styles.profileMeta}>Tank capacity: {item.tankCapacity} gal</Text>
          {selectedVehicle?.vehicleName === item.vehicleName && <Text style={styles.currentVehicle}>Selected for trips</Text>}
          <View style={styles.vehicleActions}>
            <Pressable onPress={() => navigation.navigate("VehicleSetup", { assistantName, user, vehicle: item, vehicles })} style={styles.vehicleActionPrimary}>
              <Ionicons color={colors.surface} name="create-outline" size={17} />
              <Text style={styles.vehicleActionPrimaryText}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (vehicles.length <= 1) {
                  setDeleteMessage("Waylo needs at least one vehicle to estimate route range and fuel cost. Add another vehicle first, then delete this one.");
                  return;
                }
                setPendingDelete(item);
              }}
              style={styles.vehicleActionDanger}
            >
              <Ionicons color={colors.red} name="trash-outline" size={17} />
              <Text style={styles.vehicleActionDangerText}>Delete</Text>
            </Pressable>
          </View>
        </PremiumCard>
      ))}
      <Modal transparent visible={Boolean(pendingDelete) || Boolean(deleteMessage)} animationType="fade">
        <View style={styles.modalBackdrop}>
          <PremiumCard style={styles.confirmCard}>
            <View style={styles.confirmIcon}>
              <Ionicons color={colors.red} name="trash-outline" size={24} />
            </View>
            <Text style={styles.cardTitle}>{pendingDelete ? "Delete vehicle?" : "Keep one vehicle"}</Text>
            <Text style={styles.profileMeta}>
              {pendingDelete
                ? `${pendingDelete.vehicleName} will be removed from your vehicle list. Existing trips stay saved.`
                : deleteMessage}
            </Text>
            {pendingDelete ? (
              <View style={styles.confirmActions}>
                <Pressable onPress={() => setPendingDelete(null)} style={styles.confirmSecondary}>
                  <Text style={styles.confirmSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => removeVehicle(pendingDelete)} style={styles.confirmDanger}>
                  <Text style={styles.confirmDangerText}>Delete</Text>
                </Pressable>
              </View>
            ) : (
              <PrimaryButton title="Got it" onPress={() => setDeleteMessage("")} />
            )}
          </PremiumCard>
        </View>
      </Modal>
    </>
  );
}

function ProfileContent({ assistantName, setAssistantName, user, setUser, navigation, tripCount }) {
  const [profileName, setProfileName] = useState(user?.name || "Sai");
  const [assistantDraft, setAssistantDraft] = useState(assistantName);
  const phone = user?.phone || "+1 (555) 123-4567";
  const [editing, setEditing] = useState(false);
  const [nameError, setNameError] = useState("");
  const [assistantNameError, setAssistantNameError] = useState("");
  const [fuelAlerts, setFuelAlerts] = useState(true);
  const [restReminders, setRestReminders] = useState(true);
  const [restInterval, setRestInterval] = useState("2.5 hours");

  function toggleEditing() {
    if (!editing) {
      setProfileName(user?.name || profileName);
      setAssistantDraft(assistantName);
      setNameError("");
      setAssistantNameError("");
      setEditing(true);
      return;
    }
    const validName = profileName.trim().length >= 2;
    const validAssistantName = assistantDraft.trim().length >= 2;
    setNameError(validName ? "" : "Enter at least 2 characters.");
    setAssistantNameError(validAssistantName ? "" : "Enter at least 2 characters.");
    if (validName && validAssistantName) {
      const nextAssistantName = assistantDraft.trim() || "Waylo";
      if (user?.id) {
        updateUser(user.id, { name: profileName.trim(), assistant_name: nextAssistantName })
          .then((updated) => {
            setUser(updated);
            setAssistantName(updated.assistant_name || nextAssistantName);
          })
          .catch((error) => console.warn("Waylo API profile update unavailable:", error.message));
      }
      setAssistantName(nextAssistantName);
      setEditing(false);
    }
  }

  function signOut() {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Splash" }]
      })
    );
  }

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Pressable onPress={toggleEditing} hitSlop={8} style={styles.textAction}>
          <Text style={styles.viewAll}>{editing ? "Done" : "Edit profile"}</Text>
        </Pressable>
      </View>
      <PremiumCard style={styles.profileCard}>
        {editing ? (
          <>
            <ProfileInput label="Name" value={profileName} onChangeText={setProfileName} error={nameError} />
            <ProfileInput label="Assistant name" value={assistantDraft} onChangeText={setAssistantDraft} error={assistantNameError} />
            <View style={styles.verifiedPhoneRow}>
              <Ionicons color={colors.green} name="shield-checkmark-outline" size={18} />
              <View style={styles.recentText}>
                <Text style={styles.profileMeta}>{phone}</Text>
                <Text style={styles.preferenceSub}>Phone changes will require OTP re-verification.</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.cardTitle}>{profileName}</Text>
            <Text style={styles.profileMeta}>{phone}</Text>
            <Text style={styles.profileMeta}>Assistant name: {assistantName}</Text>
          </>
        )}
        <Text style={styles.profileMeta}>Saved trips: {tripCount}</Text>
      </PremiumCard>
      <PremiumCard style={styles.profileCard}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <PreferenceRow label="Fuel savings alerts" value={fuelAlerts} onValueChange={setFuelAlerts} />
        <ReminderPreference
          enabled={restReminders}
          interval={restInterval}
          onIntervalChange={setRestInterval}
          onToggle={setRestReminders}
        />
      </PremiumCard>
      <PremiumCard style={styles.accountCard}>
        <View>
          <Text style={styles.cardTitle}>Account</Text>
          <Text style={styles.profileMeta}>Return to the welcome screen and end this local session.</Text>
        </View>
        <PrimaryButton title="Sign Out" variant="secondary" onPress={signOut} />
      </PremiumCard>
    </>
  );
}

function ProfileInput({ label, value, onChangeText, error, keyboardType = "default" }) {
  return (
    <View style={styles.profileInputWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput keyboardType={keyboardType} value={value} onChangeText={onChangeText} style={[styles.profileInput, !!error && styles.invalidInput]} />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function PreferenceRow({ label, value, onValueChange }) {
  return (
    <View style={styles.preferenceRow}>
      <Text style={styles.profileMeta}>{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={colors.surface}
        trackColor={{ false: colors.border, true: colors.green }}
        value={value}
      />
    </View>
  );
}

function ReminderPreference({ enabled, interval, onIntervalChange, onToggle }) {
  const options = ["2 hours", "2.5 hours", "3 hours", "4 hours"];

  return (
    <View style={styles.reminderBlock}>
      <View style={styles.preferenceRow}>
        <View style={styles.preferenceText}>
          <Text style={styles.profileMeta}>Rest break timing</Text>
          <Text style={styles.preferenceSub}>{enabled ? `Every ${interval}` : "Paused"}</Text>
        </View>
        <Switch
          onValueChange={onToggle}
          thumbColor={colors.surface}
          trackColor={{ false: colors.border, true: colors.green }}
          value={enabled}
        />
      </View>
      {enabled && (
        <View style={styles.intervalChips}>
          {options.map((option) => {
            const selected = option === interval;
            return (
              <Pressable
                key={option}
                onPress={() => onIntervalChange(option)}
                style={[styles.intervalChip, selected && styles.intervalChipActive]}
              >
                <Text style={[styles.intervalChipText, selected && styles.intervalChipTextActive]}>
                  {option.replace(" hours", "h")}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function TripField({ label, value, onChangeText, onSelectPlace, onSearchStateChange, onUseCurrentLocation, locating, pinColor, suggestions = [] }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const trimmedValue = value.trim();
  const fallbackSuggestions = suggestions
    .filter((item) => item.label.toLowerCase().includes(trimmedValue.toLowerCase()))
    .slice(0, 4);
  const visibleSuggestions = hasMapboxToken() && trimmedValue.length >= 2 ? remoteSuggestions : fallbackSuggestions;

  React.useEffect(() => {
    if (!showSuggestions || trimmedValue.length < 2 || trimmedValue.toLowerCase() === "current location") {
      setRemoteSuggestions([]);
      setSearchError("");
      setIsSearching(false);
      onSearchStateChange?.(false);
      return undefined;
    }

    let active = true;
    setIsSearching(true);
    setSearchError("");
    onSearchStateChange?.(true);
    const timer = setTimeout(() => {
      geocodeAddress(trimmedValue)
        .then((places) => {
          if (!active) return;
          setRemoteSuggestions(places);
        })
        .catch((error) => {
          if (!active) return;
          setRemoteSuggestions([]);
          setSearchError(error.code === "MAPBOX_TOKEN_MISSING" ? "Add a Mapbox token to search real places." : "Could not search locations right now.");
        })
        .finally(() => {
          if (!active) return;
          setIsSearching(false);
          onSearchStateChange?.(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
      onSearchStateChange?.(false);
    };
  }, [showSuggestions, trimmedValue]);

  return (
    <View style={styles.tripFieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.tripField}>
        <View style={[styles.pin, { backgroundColor: pinColor }]} />
        <TextInput
          onFocus={() => setShowSuggestions(true)}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            onSelectPlace?.(null);
            setShowSuggestions(true);
          }}
          style={styles.input}
        />
        <Pressable onPress={() => setShowSuggestions((open) => !open)} hitSlop={8}>
          <Ionicons color={colors.navy} name={showSuggestions ? "chevron-up" : "add"} size={18} />
        </Pressable>
      </View>
      {showSuggestions && (
        <View style={styles.locationSuggestions}>
          {onUseCurrentLocation && (
            <Pressable onPress={onUseCurrentLocation} style={styles.locationSuggestion}>
              <Ionicons color={colors.blue} name="locate-outline" size={16} />
              <View style={styles.recentText}>
                <Text style={styles.locationSuggestionText}>{locating ? "Finding your location..." : "Use my current location"}</Text>
                <Text style={styles.locationSuggestionMeta}>Requires location permission in Expo Go</Text>
              </View>
            </Pressable>
          )}
          {onUseCurrentLocation && <View style={styles.listDivider} />}
          {isSearching && (
            <View style={styles.locationSuggestion}>
              <Ionicons color={colors.muted} name="sync-outline" size={16} />
              <Text style={styles.locationSuggestionText}>Searching Mapbox...</Text>
            </View>
          )}
          {!isSearching && visibleSuggestions.map((item) => (
            <Pressable
              key={`${label}-${item.id || item.label}`}
              onPress={() => {
                onChangeText(item.label);
                onSelectPlace?.(item);
                setShowSuggestions(false);
              }}
              style={styles.locationSuggestion}
            >
              <Ionicons color={pinColor} name={item.id === "current-location" ? "navigate-outline" : "location-outline"} size={16} />
              <View style={styles.recentText}>
                <Text style={styles.locationSuggestionText}>{item.label}</Text>
                {!!item.address && item.address !== item.label && <Text style={styles.locationSuggestionMeta}>{item.address}</Text>}
              </View>
            </Pressable>
          ))}
          {!isSearching && visibleSuggestions.length === 0 && (
            <View style={styles.locationSuggestion}>
              <Ionicons color={colors.muted} name="information-circle-outline" size={16} />
              <Text style={styles.locationSuggestionText}>{searchError || "No matching places found."}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function RecentTrip({ title, date, onPress, badge }) {
  return (
    <Pressable onPress={onPress} style={styles.recentTrip}>
      <View style={styles.recentText}>
        <Text style={styles.recentTitle}>{title}</Text>
        <Text style={styles.recentDate}>{date}</Text>
      </View>
      {badge && <Text style={styles.tripBadge}>{badge}</Text>}
      <Text style={styles.chevron}>{">"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.appBackground,
    flex: 1,
    paddingBottom: 0
  },
  greetingCard: {
    alignItems: "center",
    backgroundColor: colors.headerBlue,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md
  },
  greeting: {
    color: colors.navy,
    fontSize: 19,
    fontWeight: "800"
  },
  assistant: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  bellButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.pill,
    height: 38,
    justifyContent: "center",
    position: "relative",
    width: 38
  },
  bellDot: {
    backgroundColor: colors.orange,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 10,
    position: "absolute",
    right: 8,
    top: 8,
    width: 10
  },
  container: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: screen.maxWidth,
    paddingHorizontal: screen.padding,
    paddingBottom: 112,
    paddingTop: spacing.sm,
    width: "100%"
  },
  homeHero: {
    alignItems: "flex-start",
    backgroundColor: colors.navy,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    overflow: "visible",
    padding: spacing.md,
    position: "relative",
    zIndex: 4
  },
  heroMain: {
    flex: 1
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  heroEyebrow: {
    color: "#8EE7C8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  heroStatus: {
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: radii.pill,
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4
  },
  heroCopy: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 4,
    maxWidth: 285
  },
  heroMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  miniMetric: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  miniMetricLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "700"
  },
  miniMetricValue: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1
  },
  notificationPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
    position: "absolute",
    right: 10,
    shadowColor: colors.navy,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    top: 62,
    width: "86%",
    elevation: 12,
    zIndex: 8
  },
  popoverPointer: {
    backgroundColor: colors.surface,
    borderLeftColor: colors.border,
    borderTopColor: colors.border,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    height: 14,
    position: "absolute",
    right: 18,
    top: -7,
    transform: [{ rotate: "45deg" }],
    width: 14
  },
  notificationHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs
  },
  notificationHeading: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  notificationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  notificationIcon: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.pill,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  notificationDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2
  },
  tripCard: {
    gap: spacing.md,
    zIndex: 1
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  tripFieldWrap: {
    gap: spacing.xs
  },
  tripField: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  locationSuggestions: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 2,
    marginTop: spacing.xs,
    overflow: "hidden"
  },
  locationSuggestion: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    outlineStyle: "none",
    paddingHorizontal: spacing.md
  },
  locationSuggestionText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "700"
  },
  locationSuggestionMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },
  pin: {
    borderRadius: radii.pill,
    height: 14,
    marginRight: spacing.sm,
    width: 14
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "600"
  },
  fieldAction: {
    color: colors.navy,
    fontSize: 18,
    fontWeight: "800"
  },
  modes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  viewAll: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "700"
  },
  textAction: {
    outlineStyle: "none"
  },
  recentCard: {
    gap: spacing.xs,
    paddingVertical: spacing.sm
  },
  groupLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    textTransform: "uppercase"
  },
  tripSections: {
    backgroundColor: colors.appBackground,
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
    padding: 4
  },
  tripSectionTab: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  tripSectionTabActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.navy,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  tripSectionText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  tripSectionTextActive: {
    color: colors.navy
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    padding: spacing.sm
  },
  recentTrip: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    padding: spacing.sm
  },
  recentText: {
    flex: 1
  },
  recentTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  recentDate: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  chevron: {
    color: colors.navy,
    fontSize: 24,
    fontWeight: "700"
  },
  listDivider: {
    backgroundColor: colors.border,
    height: 1
  },
  tripBadge: {
    backgroundColor: colors.paleGreen,
    borderRadius: radii.pill,
    color: colors.green,
    fontSize: 11,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  tabBar: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    maxWidth: screen.maxWidth,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    width: "100%"
  },
  tabItem: {
    alignItems: "center",
    gap: 3,
    outlineStyle: "none"
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  activeTab: {
    color: colors.navy
  },
  profileCard: {
    gap: spacing.md
  },
  accountCard: {
    gap: spacing.md
  },
  selectedVehicleCard: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 58,
    outlineStyle: "none",
    padding: spacing.sm
  },
  vehicleIconMini: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  selectedVehicleText: {
    flex: 1
  },
  selectedVehicleLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  selectedVehicleName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2
  },
  vehiclePicker: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm
  },
  pickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  doneText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "700"
  },
  vehicleOption: {
    alignItems: "center",
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.sm,
    outlineStyle: "none",
    padding: spacing.sm
  },
  vehicleOptionName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  vehicleOptionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  addVehicleInline: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    outlineStyle: "none",
    padding: spacing.sm
  },
  addVehicleText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "700"
  },
  vehicleListCard: {
    gap: spacing.md
  },
  vehicleActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  vehicleActionPrimary: {
    alignItems: "center",
    backgroundColor: colors.blue,
    borderRadius: radii.pill,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 46,
    outlineStyle: "none"
  },
  vehicleActionPrimaryText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800"
  },
  vehicleActionDanger: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: "rgba(239,68,68,0.24)",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 46,
    outlineStyle: "none",
    paddingHorizontal: spacing.md
  },
  vehicleActionDangerText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: "800"
  },
  navigateHero: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  navigateIcon: {
    alignItems: "center",
    backgroundColor: colors.blue,
    borderRadius: radii.pill,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  navigateCopy: {
    flex: 1
  },
  liveMapCard: {
    backgroundColor: colors.mapBlue,
    borderRadius: radii.xl,
    height: 560,
    overflow: "hidden",
    position: "relative"
  },
  mapLandMass: {
    backgroundColor: colors.mapGreen,
    borderRadius: 260,
    height: 470,
    left: -120,
    position: "absolute",
    top: 40,
    transform: [{ rotate: "-18deg" }],
    width: 380
  },
  mapRoadOne: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 999,
    height: 520,
    left: 245,
    position: "absolute",
    top: -42,
    transform: [{ rotate: "28deg" }],
    width: 26
  },
  mapRoadTwo: {
    backgroundColor: "rgba(47,128,237,0.72)",
    borderRadius: 999,
    height: 420,
    left: 164,
    position: "absolute",
    top: 68,
    transform: [{ rotate: "-18deg" }],
    width: 10
  },
  currentLocationPulse: {
    backgroundColor: "rgba(47,128,237,0.16)",
    borderRadius: radii.pill,
    height: 92,
    left: "46%",
    position: "absolute",
    top: 180,
    width: 92
  },
  currentLocationDot: {
    alignItems: "center",
    backgroundColor: colors.blue,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 4,
    height: 52,
    justifyContent: "center",
    left: "51%",
    position: "absolute",
    top: 200,
    width: 52
  },
  mapCaption: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: radii.md,
    left: spacing.md,
    padding: spacing.sm,
    position: "absolute",
    right: spacing.md,
    top: spacing.md
  },
  mapCaptionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  mapCaptionText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  routeSheet: {
    bottom: spacing.md,
    left: spacing.md,
    position: "absolute",
    right: spacing.md
  },
  navPlanRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  startMiniButton: {
    alignItems: "center",
    backgroundColor: colors.green,
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    paddingHorizontal: spacing.sm
  },
  startMiniText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "800"
  },
  vehiclePhoto: {
    alignItems: "center",
    backgroundColor: colors.paleBlue,
    borderRadius: radii.md,
    height: 128,
    justifyContent: "center",
    overflow: "hidden"
  },
  vehiclePhotoRoad: {
    backgroundColor: "rgba(11,45,92,0.08)",
    borderRadius: 999,
    bottom: -34,
    height: 86,
    position: "absolute",
    width: 320
  },
  currentVehicle: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700"
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(11, 31, 59, 0.34)",
    flex: 1,
    justifyContent: "center",
    padding: screen.padding
  },
  confirmCard: {
    alignItems: "stretch",
    gap: spacing.md,
    maxWidth: screen.maxWidth - screen.padding * 2,
    width: "100%"
  },
  confirmIcon: {
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.1)",
    borderRadius: radii.pill,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  confirmActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  confirmSecondary: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48
  },
  confirmSecondaryText: {
    color: colors.navy,
    fontSize: 14,
    fontWeight: "800"
  },
  confirmDanger: {
    alignItems: "center",
    backgroundColor: colors.red,
    borderRadius: radii.pill,
    flex: 1,
    justifyContent: "center",
    minHeight: 48
  },
  confirmDangerText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800"
  },
  profileInputWrap: {
    gap: spacing.xs
  },
  profileInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: spacing.md
  },
  invalidInput: {
    borderColor: colors.red
  },
  errorText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: "700"
  },
  verifiedPhoneRow: {
    alignItems: "flex-start",
    backgroundColor: colors.paleGreen,
    borderColor: "rgba(24,184,117,0.18)",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  preferenceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  preferenceText: {
    flex: 1,
    paddingRight: spacing.sm
  },
  preferenceSub: {
    color: colors.mutedLight,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  reminderBlock: {
    gap: spacing.sm
  },
  intervalChips: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  intervalChip: {
    alignItems: "center",
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    outlineStyle: "none",
    paddingHorizontal: spacing.sm
  },
  intervalChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy
  },
  intervalChipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  intervalChipTextActive: {
    color: colors.surface
  },
  profileMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  }
});
