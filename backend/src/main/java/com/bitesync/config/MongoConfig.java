package com.bitesync.config;

import com.bitesync.model.user.*;
import org.bson.Document;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new UserReadConverter());
        converters.add(new UserWriteConverter());
        return new MongoCustomConversions(converters);
    }

    /**
     * Polymorphic User Deserializer from MongoDB documents.
     * Demonstrates POLYMORPHISM & FACTORY-style entity restoration.
     */
    public static class UserReadConverter implements Converter<Document, User> {
        @Override
        public User convert(Document doc) {
            String role = doc.getString("role");
            User user;

            if ("admin".equalsIgnoreCase(role)) {
                Admin admin = new Admin();
                admin.setAdminDepartment(doc.getString("adminDepartment"));
                admin.setIsSuperAdmin(doc.getBoolean("isSuperAdmin", true));
                user = admin;
            } else if ("kitchen".equalsIgnoreCase(role)) {
                KitchenStaff staff = new KitchenStaff();
                staff.setAssignedStation(doc.getString("assignedStation"));
                staff.setShiftTiming(doc.getString("shiftTiming"));
                user = staff;
            } else {
                Student student = new Student();
                student.setStudentId(doc.getString("studentId"));
                student.setDietaryPreference(doc.getString("dietaryPreference"));

                Document hostelDoc = (Document) doc.get("hostel");
                if (hostelDoc != null) {
                    HostelDetails hostel = new HostelDetails(
                            hostelDoc.getString("hostelName"),
                            hostelDoc.getString("block"),
                            hostelDoc.getString("roomNumber")
                    );
                    student.setHostel(hostel);
                }
                user = student;
            }

            // Populate base User fields
            Object idObj = doc.get("_id");
            if (idObj != null) {
                user.setId(idObj.toString());
            }
            user.setName(doc.getString("name"));
            user.setEmail(doc.getString("email"));
            user.setPassword(doc.getString("password"));
            user.setRole(role != null ? role.toLowerCase() : "student");
            user.setPhone(doc.getString("phone"));
            user.setAvatar(doc.getString("avatar"));
            user.setIsActive(doc.getBoolean("isActive", true));

            Date createdAt = doc.getDate("createdAt");
            if (createdAt != null) user.setCreatedAt(createdAt);

            Date updatedAt = doc.getDate("updatedAt");
            if (updatedAt != null) user.setUpdatedAt(updatedAt);

            return user;
        }
    }

    /**
     * Polymorphic User Serializer to MongoDB documents.
     */
    public static class UserWriteConverter implements Converter<User, Document> {
        @Override
        public Document convert(User user) {
            Document doc = new Document();
            if (user.getId() != null) {
                if (org.bson.types.ObjectId.isValid(user.getId())) {
                    doc.put("_id", new org.bson.types.ObjectId(user.getId()));
                } else {
                    doc.put("_id", user.getId());
                }
            }
            doc.put("name", user.getName());
            doc.put("email", user.getEmail());
            doc.put("password", user.getPassword());
            doc.put("role", user.getRole());
            doc.put("phone", user.getPhone());
            doc.put("avatar", user.getAvatar());
            doc.put("isActive", user.getIsActive());
            doc.put("createdAt", user.getCreatedAt());
            doc.put("updatedAt", user.getUpdatedAt());

            if (user instanceof Student s) {
                doc.put("studentId", s.getStudentId());
                doc.put("dietaryPreference", s.getDietaryPreference());
                if (s.getHostel() != null) {
                    Document hostelDoc = new Document();
                    hostelDoc.put("hostelName", s.getHostel().getHostelName());
                    hostelDoc.put("block", s.getHostel().getBlock());
                    hostelDoc.put("roomNumber", s.getHostel().getRoomNumber());
                    doc.put("hostel", hostelDoc);
                }
            } else if (user instanceof Admin a) {
                doc.put("adminDepartment", a.getAdminDepartment());
                doc.put("isSuperAdmin", a.getIsSuperAdmin());
            } else if (user instanceof KitchenStaff k) {
                doc.put("assignedStation", k.getAssignedStation());
                doc.put("shiftTiming", k.getShiftTiming());
            }

            return doc;
        }
    }
}
