import { FlatList, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { selectItems } from '../Redux/itemReducer';
import { useSelector } from 'react-redux';

const ItemList = () => {
    const navigation = useNavigation();
    const data = useSelector(selectItems);
    const sortedItems = useMemo(() => {
        return [...data].sort((a, b) => {
          const dateA = new Date(a.expirationDate);
          const dateB = new Date(b.expirationDate);
          return dateA - dateB;
        });
      }, [data]);
    const expiringItems = useMemo(() => {
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        return data.filter(item => {
            const expirationDate = item.expirationDate;
            return expirationDate >= today && expirationDate <= threeDaysLater;
        });
    }, [data]);

    console.log(data)
    const calculateDaysLeft = (expirationDate) => {
        const currentDate = new Date();
        const expDate = new Date(expirationDate);
        const timeDiff = expDate - currentDate;
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 *24));
        return daysLeft
    };
    const navigateModify = (item) => {
        //TODO: Build Modify Screen
        navigation.navigate('Modify', { item })
    }
    const getContainer = (item) => {
        if(item.container === '00000000'){
            return 'No Container'
        }
        else{
            return item.container
        }
    }
    const renderItem = ({item}) => {
        return(
            <View>
                <TouchableOpacity style={[styles.item, item.style]} onPress={() => navigateModify(item)}>
                    <View style={styles.textContainer}>
                        <View>
                            <Text style={[styles.itemText, {fontSize: 25}, item.textStyle]}>{item.name}</Text>
                            <Text style={[styles.itemText, item.textStyle]}>{getContainer(item)}</Text>
                        </View>
                        <Text style={[styles.itemText, {fontSize: 50}, item.textStyle]}>{calculateDaysLeft(item.expirationDate)}</Text>   
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
    const renderEmptyComponent = () => {
        return(
        <View style={styles.emptyContainer}>
          <Text style={styles.Text}>There are no items</Text>
        </View>
        )
    }
  return (
    <View>
        <Text style={styles.labelText}>Expiring Soon</Text>
        <FlatList
            style={styles.flatList}
            data={expiringItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={renderEmptyComponent}
        />
        <Text style={styles.labelText}>All Items</Text>
        <FlatList
            style={styles.flatList}
            data={sortedItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={renderEmptyComponent}
        />
    </View>
  )
}

export default ItemList

const styles = StyleSheet.create({
    item: {
        borderRadius: 10,
        borderWidth: 1,
        margin: 5
    },
    itemText: {
        paddingHorizontal: 24,
        padding: 5
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    labelText: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    flatList: {
        marginVertical: 10,
        paddingBottom: 25
    }
})