
export const serializeEquipment = (equipment) => {
  const { _id, owner, ...equipmentData } = equipment;

  let serializedOwner = owner;

  if (owner && typeof owner.toHexString === "function") {
    serializedOwner = owner.toString();
  } else if (
    owner &&
    typeof owner === "object" &&
    "_id" in owner
  ) {
    const { _id: ownerId, ...ownerData } = owner;

    serializedOwner = {
      ...ownerData,
      id: ownerId.toString(),
    };
  }

  return {
    ...equipmentData,
    id: _id.toString(),
    owner: serializedOwner,
  };
};
