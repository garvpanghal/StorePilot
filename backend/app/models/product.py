from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Numeric, Text, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.hybrid import hybrid_property
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    store_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("store_id", "sku", name="uix_store_product_sku"),
    )
    category_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    supplier_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    selling_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    cost_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    current_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    category = relationship("Category", back_populates="products", lazy="selectin")
    supplier = relationship("Supplier", back_populates="products", lazy="selectin")
    sale_items = relationship("SaleItem", back_populates="product", lazy="noload")
    purchase_items = relationship("PurchaseItem", back_populates="product", lazy="noload")
    inventory_transactions = relationship(
        "InventoryTransaction", back_populates="product", lazy="noload"
    )

    @hybrid_property
    def stock_status(self) -> str:
        """Derived stock status — never stored, always computed."""
        if self.current_stock <= 0:
            return "Out of Stock"
        if self.current_stock <= self.reorder_level * 0.5:
            return "Critical"
        if self.current_stock <= self.reorder_level:
            return "Low Stock"
        return "In Stock"
