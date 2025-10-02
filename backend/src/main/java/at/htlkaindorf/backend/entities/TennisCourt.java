package at.htlkaindorf.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TennisCourt {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long tennisCourtId;

    private String name;

    @OneToMany(mappedBy = "tennisCourt", cascade = CascadeType.ALL)
    private List<Entry> entries = new ArrayList<>();
}
