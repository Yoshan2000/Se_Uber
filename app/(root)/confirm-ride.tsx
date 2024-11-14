import { FlatList, Text, View } from "react-native";
import RideLayout from "@/components/RideLayout";
import DriverCard from "@/components/DriverCard";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { useDriverStore } from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

  return (
    <RideLayout title="Choose the driver" snapPoints={["15%", "60%"]}>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DriverCard
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(Number(item.id))}
            item={item}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-6">
            <CustomButton
              title={"Select Driver"}
              onPress={() => {
                if (selectedDriver) router.push("/(root)/book-ride");
                else alert("Please select a driver");
              }}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};
export default ConfirmRide;
