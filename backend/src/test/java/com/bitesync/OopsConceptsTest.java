package com.bitesync;

import com.bitesync.discount.DiscountFactory;
import com.bitesync.discount.FixedDiscountStrategy;
import com.bitesync.discount.HostelOfferDiscountStrategy;
import com.bitesync.discount.PercentageDiscountStrategy;
import com.bitesync.model.menu.MenuItem;
import com.bitesync.model.slot.PickupSlot;
import com.bitesync.model.user.Admin;
import com.bitesync.model.user.HostelDetails;
import com.bitesync.model.user.KitchenStaff;
import com.bitesync.model.user.Student;
import com.bitesync.model.user.User;
import com.bitesync.model.wallet.Wallet;
import com.bitesync.utils.HmacSigner;
import com.bitesync.utils.TokenGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class OopsConceptsTest {

    @Test
    @DisplayName("OOPS 1: Inheritance & Polymorphism in User Hierarchy")
    void testUserHierarchyInheritanceAndPolymorphism() {
        // Polymorphic reference: User points to concrete subclass instances
        User student = new Student("Aarav Sharma", "aarav@bitesync.com", "pass123", "STU-2024",
                new HostelDetails("Aryabhata Bhavan", "Block-B", "204"));
        User admin = new Admin("Campus Admin", "admin@bitesync.com", "pass123", "Finance");
        User kitchen = new KitchenStaff("Ramesh Cook", "kitchen@bitesync.com", "pass123", "South Indian Counter");

        // Dynamic Method Dispatch (Runtime Polymorphism)
        assertEquals("STU-2024", student.getIdentifier());
        assertEquals("Hostel Student", student.getDisplayRole());
        assertFalse(student.hasAdminPrivileges());

        assertEquals("ADMIN-admin@bitesync.com", admin.getIdentifier());
        assertEquals("Canteen Administrator", admin.getDisplayRole());
        assertTrue(admin.hasAdminPrivileges());

        assertEquals("STAFF-South Indian Counter", kitchen.getIdentifier());
        assertEquals("Kitchen Operations Staff", kitchen.getDisplayRole());
        assertFalse(kitchen.hasAdminPrivileges());
    }

    @Test
    @DisplayName("OOPS 2: Encapsulation in Wallet and Slot invariants")
    void testEncapsulationInWalletAndSlots() {
        Wallet wallet = new Wallet("student-1", 500.0);
        assertTrue(wallet.hasSufficientBalance(300.0));
        wallet.deduct(200.0);
        assertEquals(300.0, wallet.getBalance());

        // Invariant protection
        assertThrows(IllegalStateException.class, () -> wallet.deduct(400.0));
        assertThrows(IllegalArgumentException.class, () -> wallet.credit(-50.0));

        // PickupSlot encapsulation
        PickupSlot slot = new PickupSlot("08:00", "08:15", "breakfast", "2026-11-18", 2);
        assertEquals(2, slot.getRemainingCapacity());
        slot.bookSlot();
        assertEquals(1, slot.getRemainingCapacity());
        slot.bookSlot();
        assertEquals(0, slot.getRemainingCapacity());
        assertFalse(slot.hasAvailableCapacity());

        // Overbooking prevention
        assertThrows(IllegalStateException.class, slot::bookSlot);
    }

    @Test
    @DisplayName("OOPS 3: Encapsulation in MenuItem Stock Lifecycle")
    void testMenuItemEncapsulation() {
        MenuItem dish = new MenuItem("Masala Dosa", 60.0, "breakfast", true);
        dish.setStockQuantity(5);
        assertTrue(dish.hasAvailableStock(3));

        dish.deductStock(3);
        assertEquals(2, dish.getStockQuantity());
        assertTrue(dish.getIsAvailable());

        dish.deductStock(2);
        assertEquals(0, dish.getStockQuantity());
        assertFalse(dish.getIsAvailable());

        assertThrows(IllegalStateException.class, () -> dish.deductStock(1));
    }

    @Test
    @DisplayName("OOPS 4: Polymorphic Discount Strategy Execution")
    void testPolymorphicDiscountStrategies() {
        DiscountFactory factory = new DiscountFactory(List.of(
                new PercentageDiscountStrategy(),
                new HostelOfferDiscountStrategy(),
                new FixedDiscountStrategy()
        ));

        // 10% coupon (BITESYNC10): 10% of 200 = 20
        double discount1 = factory.resolveAndApplyDiscount(200.0, "BITESYNC10");
        assertEquals(20.0, discount1);

        // 20% coupon (HOSTEL20) on 250: 20% of 250 = 50 (max 60)
        double discount2 = factory.resolveAndApplyDiscount(250.0, "HOSTEL20");
        assertEquals(50.0, discount2);

        // Invalid coupon
        double discount3 = factory.resolveAndApplyDiscount(250.0, "INVALID99");
        assertEquals(0.0, discount3);
    }

    @Test
    @DisplayName("OOPS 5: Cryptographic Token & HMAC-SHA256 Signing")
    void testTokenAndHmacVerification() {
        String orderNum = TokenGenerator.generateOrderNumber();
        String token = TokenGenerator.generatePickupToken();

        assertTrue(orderNum.startsWith("BS-"));
        assertTrue(token.startsWith("TK-"));

        HmacSigner signer = new HmacSigner("bitesync-qr-secret-key-2026");
        String qrPayload = signer.generateQRPayload("order-123", orderNum, token);

        HmacSigner.VerificationResult result = signer.verifyQRPayload(qrPayload);
        assertTrue(result.isValid());
        assertEquals("order-123", result.getOrderId());
        assertEquals(orderNum, result.getOrderNumber());
        assertEquals(token, result.getPickupToken());

        // Tampered payload
        String tampered = qrPayload.replace(orderNum, "BS-99999");
        HmacSigner.VerificationResult tamperedResult = signer.verifyQRPayload(tampered);
        assertFalse(tamperedResult.isValid());
    }
}
