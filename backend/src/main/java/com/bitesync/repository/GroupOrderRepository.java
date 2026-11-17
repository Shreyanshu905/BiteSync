package com.bitesync.repository;

import com.bitesync.model.group.GroupOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupOrderRepository extends MongoRepository<GroupOrder, String> {

    Optional<GroupOrder> findByGroupCode(String groupCode);
}
