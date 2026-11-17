package com.bitesync.repository;

import com.bitesync.model.order.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByPickupToken(String pickupToken);

    List<Order> findByStudentOrderByCreatedAtDesc(String studentId);

    List<Order> findByStatusOrderByCreatedAtDesc(String status);

    List<Order> findByStatusInOrderByCreatedAtDesc(List<String> statuses);

    List<Order> findByCreatedAtBetween(Date start, Date end);

    List<Order> findAllByOrderByCreatedAtDesc();
}
