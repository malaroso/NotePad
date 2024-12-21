import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserDetail, UserDetail } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen = () => {
    const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { onLogout } = useAuth();

    useEffect(() => {
        loadUserDetail();
    }, []);

    const loadUserDetail = async () => {
        try {
            setLoading(true);
            const response = await getUserDetail();
            if (response.status && response.data.length > 0) {
                setUserDetail(response.data[0]);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getPermissionIcon = (permission: string) => {
        switch (permission) {
            case 'create_post':
                return 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png';
            case 'edit_post':
                return 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png';
            case 'delete_post':
                return 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png';
            case 'view_post':
                return 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png';
            default:
                return 'https://cdn-icons-png.flaticon.com/512/1250/1250615.png';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4B7BF5" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.username}>{userDetail?.username}</Text>
                    <Text style={styles.role}>{userDetail?.role_description}</Text>
                </View>

                {/* Info Cards */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/561/561127.png' }}
                            style={styles.infoIcon}
                        />
                        <View>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{userDetail?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1534/1534939.png' }}
                            style={styles.infoIcon}
                        />
                        <View>
                            <Text style={styles.infoLabel}>Kullanıcı ID</Text>
                            <Text style={styles.infoValue}>#{userDetail?.user_id}</Text>
                        </View>
                    </View>
                </View>

                {/* Permissions Section */}
                <View style={styles.permissionsSection}>
                    <Text style={styles.sectionTitle}>İzinler</Text>
                    <View style={styles.permissionsGrid}>
                        {userDetail?.permissions.split(',').map((permission, index) => (
                            <View key={index} style={styles.permissionItem}>
                                <Image
                                    source={{ uri: getPermissionIcon(permission) }}
                                    style={styles.permissionIcon}
                                />
                                <Text style={styles.permissionText}>
                                    {permission.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828479.png' }}
                        style={styles.logoutIcon}
                    />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4B7BF5',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: '#fff',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
    },
    role: {
        fontSize: 16,
        color: '#E0E0E0',
        marginTop: 5,
    },
    infoSection: {
        padding: 20,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    infoIcon: {
        width: 24,
        height: 24,
        marginRight: 15,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    permissionsSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    permissionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    permissionItem: {
        width: '48%',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    permissionIcon: {
        width: 30,
        height: 30,
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        margin: 20,
        padding: 15,
        borderRadius: 10,
    },
    logoutIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
        tintColor: '#fff',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 