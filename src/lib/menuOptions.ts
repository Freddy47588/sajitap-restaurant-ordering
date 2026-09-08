import type { MenuOptionGroup, SelectedOption } from '../types/menu'

export const areMenuOptionsValid = (
  groups: MenuOptionGroup[],
  selected: SelectedOption[],
) =>
  groups.every((group) => {
    const selectedCount = selected.filter(
      (option) => option.groupId === group.id,
    ).length
    return selectedCount >= group.minSelect && selectedCount <= group.maxSelect
  })

export const toggleMenuOption = (
  group: MenuOptionGroup,
  selected: SelectedOption[],
  optionId: string,
): SelectedOption[] => {
  const option = group.options.find(
    (entry) => entry.id === optionId && entry.available,
  )
  if (!option) return selected

  const otherGroups = selected.filter((entry) => entry.groupId !== group.id)
  const active = selected.some((entry) => entry.optionId === option.id)
  const inGroup = selected.filter((entry) => entry.groupId === group.id)
  const value: SelectedOption = {
    groupId: group.id,
    groupName: group.name,
    optionId: option.id,
    optionName: option.name,
    priceDelta: option.priceDelta,
  }

  if (group.maxSelect === 1) return [...otherGroups, value]
  if (active) return selected.filter((entry) => entry.optionId !== option.id)
  if (inGroup.length >= group.maxSelect) return selected
  return [...selected, value]
}
