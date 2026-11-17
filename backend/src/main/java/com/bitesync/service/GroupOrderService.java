package com.bitesync.service;

import com.bitesync.exception.BiteSyncException;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.group.GroupMemberItem;
import com.bitesync.model.group.GroupOrder;
import com.bitesync.model.menu.MenuItem;
import com.bitesync.repository.GroupOrderRepository;
import com.bitesync.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class GroupOrderService {

    private final GroupOrderRepository groupOrderRepository;
    private final MenuItemRepository menuItemRepository;
    private final Random random = new Random();

    public GroupOrderService(GroupOrderRepository groupOrderRepository, MenuItemRepository menuItemRepository) {
        this.groupOrderRepository = groupOrderRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public GroupOrder createGroup(String creatorId, String title, String slotId) {
        String code = "GRP-" + (1000 + random.nextInt(9000));

        GroupOrder group = new GroupOrder();
        group.setGroupCode(code);
        group.setCreator(creatorId);
        group.setTitle(title != null ? title : "Hostel Group Meal");
        group.setPickupSlot(slotId);
        group.getMembers().add(new GroupOrder.MemberInfo(creatorId));

        return groupOrderRepository.save(group);
    }

    public GroupOrder getGroupByCode(String groupCode) {
        return groupOrderRepository.findByGroupCode(groupCode.toUpperCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Group order not found for code: " + groupCode));
    }

    public GroupOrder joinGroup(String groupCode, String studentId) {
        GroupOrder group = getGroupByCode(groupCode);

        boolean alreadyMember = group.getMembers().stream()
                .anyMatch(m -> m.getStudent() != null && m.getStudent().equals(studentId));

        if (!alreadyMember) {
            group.getMembers().add(new GroupOrder.MemberInfo(studentId));
            groupOrderRepository.save(group);
        }
        return group;
    }

    public GroupOrder addItemToGroup(String groupCode, String studentId, String studentName, String menuItemId, int quantity) {
        GroupOrder group = getGroupByCode(groupCode);
        if (!"open".equalsIgnoreCase(group.getStatus())) {
            throw new BiteSyncException("Group order is locked or already placed.");
        }

        MenuItem dish = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Dish not found: " + menuItemId));

        GroupMemberItem item = new GroupMemberItem(
                studentId,
                studentName != null ? studentName : "Roommate",
                dish.getId(),
                dish.getName(),
                dish.getPrice(),
                quantity
        );
        group.getItems().add(item);
        group.recalculateTotal();

        return groupOrderRepository.save(group);
    }
}
