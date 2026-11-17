package com.bitesync.service;

import com.bitesync.dto.SlotDtos;
import com.bitesync.exception.ResourceNotFoundException;
import com.bitesync.model.slot.PickupSlot;
import com.bitesync.repository.PickupSlotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SlotService {

    private final PickupSlotRepository slotRepository;

    public SlotService(PickupSlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    public List<PickupSlot> getSlots(String date, String mealPeriod) {
        String targetDate = (date != null && !date.trim().isEmpty()) ? date.trim() : LocalDate.now().toString();

        List<PickupSlot> existingForDate = slotRepository.findByDate(targetDate);
        if (existingForDate.isEmpty()) {
            initializeDefaultSlots(targetDate);
        }

        List<PickupSlot> slots;
        if (mealPeriod != null && !mealPeriod.equalsIgnoreCase("all") && !mealPeriod.trim().isEmpty()) {
            slots = slotRepository.findByDateAndMealPeriod(targetDate, mealPeriod.trim());
        } else {
            slots = slotRepository.findByDate(targetDate);
        }
        slots.sort(Comparator.comparing(PickupSlot::getStartTime));
        return slots;
    }

    private void initializeDefaultSlots(String dateStr) {
        String[][] windows = {
            {"08:00", "08:15", "breakfast", "20"}, {"08:15", "08:30", "breakfast", "20"},
            {"08:30", "08:45", "breakfast", "20"}, {"08:45", "09:00", "breakfast", "20"},
            {"09:00", "09:15", "breakfast", "20"}, {"09:15", "09:30", "breakfast", "20"},
            {"09:30", "09:45", "breakfast", "20"}, {"09:45", "10:00", "breakfast", "20"},
            {"12:30", "12:45", "lunch", "25"}, {"12:45", "13:00", "lunch", "25"},
            {"13:00", "13:15", "lunch", "25"}, {"13:15", "13:30", "lunch", "25"},
            {"13:30", "13:45", "lunch", "25"}, {"13:45", "14:00", "lunch", "25"},
            {"14:00", "14:15", "lunch", "25"}, {"14:15", "14:30", "lunch", "25"},
            {"16:30", "16:45", "snacks", "20"}, {"16:45", "17:00", "snacks", "20"},
            {"17:00", "17:15", "snacks", "20"}, {"17:15", "17:30", "snacks", "20"},
            {"17:30", "17:45", "snacks", "20"}, {"17:45", "18:00", "snacks", "20"},
            {"19:30", "19:45", "dinner", "25"}, {"19:45", "20:00", "dinner", "25"},
            {"20:00", "20:15", "dinner", "25"}, {"20:15", "20:30", "dinner", "25"},
            {"20:30", "20:45", "dinner", "25"}, {"20:45", "21:00", "dinner", "25"},
            {"21:00", "21:15", "dinner", "25"}, {"21:15", "21:30", "dinner", "25"},
            {"22:30", "22:45", "late-night", "15"}, {"22:45", "23:00", "late-night", "15"},
            {"23:00", "23:15", "late-night", "15"}, {"23:15", "23:30", "late-night", "15"},
            {"23:30", "23:45", "late-night", "15"}, {"23:45", "00:00", "late-night", "15"}
        };

        List<PickupSlot> toCreate = new ArrayList<>();
        for (String[] w : windows) {
            toCreate.add(new PickupSlot(w[0], w[1], w[2], dateStr, Integer.parseInt(w[3])));
        }
        try {
            slotRepository.saveAll(toCreate);
        } catch (Exception ignored) {
            // Ignore duplicate key race if concurrent requests initialize the same date
        }
    }

    public PickupSlot getSlotById(String id) {
        return slotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup slot not found with id: " + id));
    }

    public PickupSlot createSlot(SlotDtos.CreateSlotRequest request) {
        PickupSlot slot = new PickupSlot(
                request.getStartTime(),
                request.getEndTime(),
                request.getMealPeriod(),
                request.getDate(),
                request.getMaxCapacity()
        );
        return slotRepository.save(slot);
    }

    public PickupSlot updateSlot(String id, SlotDtos.UpdateSlotRequest request) {
        PickupSlot slot = getSlotById(id);
        if (request.getMaxCapacity() != null) slot.setMaxCapacity(request.getMaxCapacity());
        if (request.getIsClosed() != null) slot.setIsClosed(request.getIsClosed());
        if (request.getClosureReason() != null) slot.setClosureReason(request.getClosureReason());
        return slotRepository.save(slot);
    }

    public PickupSlot toggleCloseSlot(String id, String reason) {
        PickupSlot slot = getSlotById(id);
        if (Boolean.TRUE.equals(slot.getIsClosed())) {
            slot.reopenSlot();
        } else {
            slot.closeSlot(reason != null ? reason : "Slot closed by kitchen staff");
        }
        return slotRepository.save(slot);
    }
}
